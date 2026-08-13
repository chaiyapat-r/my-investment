using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTransactionsAndTrancheActuals : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "transactions");

            migrationBuilder.DropColumn(
                name: "actual_price",
                table: "plan_tranches");

            migrationBuilder.DropColumn(
                name: "actual_quantity",
                table: "plan_tranches");

            migrationBuilder.DropColumn(
                name: "filled_on",
                table: "plan_tranches");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "actual_price",
                table: "plan_tranches",
                type: "numeric(18,8)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "actual_quantity",
                table: "plan_tranches",
                type: "numeric(18,8)",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "filled_on",
                table: "plan_tranches",
                type: "date",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "transactions",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    account_id = table.Column<int>(type: "integer", nullable: false),
                    currency = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    fee = table.Column<decimal>(type: "numeric(18,8)", nullable: false),
                    price = table.Column<decimal>(type: "numeric(18,8)", nullable: false),
                    quantity = table.Column<decimal>(type: "numeric(18,8)", nullable: false),
                    side = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    symbol = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    traded_on = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_transactions", x => x.id);
                    table.ForeignKey(
                        name: "fk_transactions_accounts_account_id",
                        column: x => x.account_id,
                        principalTable: "accounts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_transactions_account_id_traded_on",
                table: "transactions",
                columns: new[] { "account_id", "traded_on" });
        }
    }
}
