using Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

/// <summary>
/// Single DbContext for the whole app. Endpoint handlers talk to it directly —
/// no repository abstraction (see CLAUDE.md).
/// </summary>
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Snapshot> Snapshots => Set<Snapshot>();
    public DbSet<CashFlow> CashFlows => Set<CashFlow>();
    public DbSet<EntryPlan> EntryPlans => Set<EntryPlan>();
    public DbSet<PlanTranche> PlanTranches => Set<PlanTranche>();

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        // Money & quantity are never floats — decimal(18,8) everywhere so crypto
        // amounts and fractional shares survive intact.
        configurationBuilder.Properties<decimal>().HaveColumnType("numeric(18,8)");
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Enums stored as readable strings, not ints.
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                var clrType = Nullable.GetUnderlyingType(property.ClrType) ?? property.ClrType;
                if (clrType.IsEnum)
                {
                    property.SetProviderClrType(typeof(string));
                    property.SetMaxLength(16);
                }
            }
        }

        modelBuilder.Entity<AppUser>(b =>
        {
            b.Property(u => u.Username).HasMaxLength(64);
            b.Property(u => u.PasswordHash).HasMaxLength(256);
            b.HasIndex(u => u.Username).IsUnique();
        });

        modelBuilder.Entity<Account>(b =>
        {
            b.Property(a => a.Name).HasMaxLength(100);
            b.Property(a => a.Color).HasMaxLength(16);
        });

        modelBuilder.Entity<Snapshot>(b =>
        {
            b.Property(s => s.Note).HasMaxLength(500);
            // One snapshot per account per day; also speeds up the forward-fill
            // lookup (latest snapshot on or before a date).
            b.HasIndex(s => new { s.AccountId, s.AsOfDate }).IsUnique();
            b.HasOne(s => s.Account)
                .WithMany()
                .HasForeignKey(s => s.AccountId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CashFlow>(b =>
        {
            b.Property(c => c.Note).HasMaxLength(500);
            b.HasIndex(c => new { c.AccountId, c.OccurredOn });
            b.HasIndex(c => c.OccurredOn);

            b.HasOne(c => c.Account)
                .WithMany()
                .HasForeignKey(c => c.AccountId)
                .OnDelete(DeleteBehavior.Restrict);

            // Second FK to Account for internal transfers.
            b.HasOne(c => c.CounterAccount)
                .WithMany()
                .HasForeignKey(c => c.CounterAccountId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<EntryPlan>(b =>
        {
            b.Property(p => p.Symbol).HasMaxLength(20);
            b.HasOne(p => p.Account)
                .WithMany()
                .HasForeignKey(p => p.AccountId)
                .OnDelete(DeleteBehavior.Restrict);
            // Deleting a plan deletes its tranches.
            b.HasMany(p => p.Tranches)
                .WithOne(t => t.Plan)
                .HasForeignKey(t => t.PlanId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
