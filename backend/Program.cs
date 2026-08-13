using Api.Data;
using Api.Domain;
using Api.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

// One-off helper: `dotnet run -- hash <password>` prints a PasswordHash to paste
// into configuration (Auth:PasswordHash). Plaintext is never persisted.
if (args.Length >= 2 && args[0] == "hash")
{
    var h = new PasswordHasher<AppUser>();
    Console.WriteLine(h.HashPassword(new AppUser { Username = "", PasswordHash = "" }, args[1]));
    return;
}

var builder = WebApplication.CreateBuilder(args);

// --- Database: PostgreSQL via EF Core (every environment) ---
// snake_case table/column names — the Postgres convention, so hand-written SQL
// doesn't need quoting (cash_flows, amount_thb).
builder.Services.AddDbContext<AppDbContext>(options =>
    options
        .UseNpgsql(builder.Configuration.GetConnectionString("Default"))
        .UseSnakeCaseNamingConvention());

// --- Authentication: single-user cookie session ---
// The .NET API is the real authorization gate. Every endpoint except
// /api/auth/login and /health requires authorization.
builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "portfolio.session";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Strict;
        options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
            ? CookieSecurePolicy.SameAsRequest   // allow http on localhost during dev
            : CookieSecurePolicy.Always;         // require TLS in production
        options.ExpireTimeSpan = TimeSpan.FromDays(1);
        options.SlidingExpiration = true;

        // This is an API: return status codes, never HTML login redirects.
        options.Events.OnRedirectToLogin = ctx =>
        {
            ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = ctx =>
        {
            ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
    });

builder.Services.AddAuthorization();

// --- Application services (DI) ---
builder.Services.AddSingleton<IPasswordHasher<AppUser>, PasswordHasher<AppUser>>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<ISnapshotService, SnapshotService>();
builder.Services.AddScoped<ICashFlowService, CashFlowService>();
builder.Services.AddScoped<IEntryPlanService, EntryPlanService>();
builder.Services.AddScoped<IChartService, ChartService>();
builder.Services.AddScoped<IHistoryService, HistoryService>();

builder.Services
    .AddControllers()
    // Entities have bidirectional navigation (EntryPlan <-> PlanTranche); ignore
    // reference cycles rather than erroring on serialization.
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        // Enums travel as their names ("THB", "USD") in JSON, matching how they
        // are stored in the database.
        o.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// --- OpenAPI / Swagger (dev only) ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Apply pending EF migrations, then seed the single user + accounts. Running
// migrations on startup means a fresh deploy (e.g. a new Supabase database)
// builds its schema automatically — no manual `dotnet ef database update` step.
using (var scope = app.Services.CreateScope())
{
    try
    {
        var sp = scope.ServiceProvider;
        await sp.GetRequiredService<AppDbContext>().Database.MigrateAsync();
        await sp.GetRequiredService<IAuthService>().EnsureSeedUserAsync();
        await sp.GetRequiredService<IAccountService>().EnsureSeededAsync();
    }
    catch (Exception ex)
    {
        // Logged (not thrown) so a transient DB outage at boot doesn't crash-loop
        // the container. If the schema is missing, this is the first log to check.
        app.Logger.LogError(ex, "Startup migration/seeding failed (database unreachable or migration error).");
    }
}

// Map ConflictException (business/uniqueness violations) to HTTP 409.
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (ConflictException ex)
    {
        context.Response.StatusCode = StatusCodes.Status409Conflict;
        await context.Response.WriteAsJsonAsync(new { error = ex.Message });
    }
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    // Land on the Swagger page instead of a bare 404 at the root.
    app.MapGet("/", () => Results.Redirect("/swagger"));
}

app.UseAuthentication();
app.UseAuthorization();

// --- Health check (anonymous) ---
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapControllers();

app.Run();
