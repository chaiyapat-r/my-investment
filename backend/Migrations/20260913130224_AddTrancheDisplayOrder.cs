using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTrancheDisplayOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "display_order",
                table: "plan_tranches",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Backfill existing tranches so each plan keeps its current visual
            // order (previously price-descending): 0,1,2,… per plan.
            migrationBuilder.Sql(@"
                UPDATE plan_tranches AS t
                SET display_order = sub.rn
                FROM (
                    SELECT id,
                           (ROW_NUMBER() OVER (PARTITION BY plan_id ORDER BY price DESC, id) - 1) AS rn
                    FROM plan_tranches
                ) AS sub
                WHERE t.id = sub.id;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "display_order",
                table: "plan_tranches");
        }
    }
}
