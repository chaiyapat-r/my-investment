using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class SnakeCaseNaming : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CashFlows_Accounts_AccountId",
                table: "CashFlows");

            migrationBuilder.DropForeignKey(
                name: "FK_CashFlows_Accounts_CounterAccountId",
                table: "CashFlows");

            migrationBuilder.DropForeignKey(
                name: "FK_EntryPlans_Accounts_AccountId",
                table: "EntryPlans");

            migrationBuilder.DropForeignKey(
                name: "FK_PlanTranches_EntryPlans_PlanId",
                table: "PlanTranches");

            migrationBuilder.DropForeignKey(
                name: "FK_Snapshots_Accounts_AccountId",
                table: "Snapshots");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Accounts_AccountId",
                table: "Transactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Users",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Transactions",
                table: "Transactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Snapshots",
                table: "Snapshots");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Accounts",
                table: "Accounts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PlanTranches",
                table: "PlanTranches");

            migrationBuilder.DropPrimaryKey(
                name: "PK_EntryPlans",
                table: "EntryPlans");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CashFlows",
                table: "CashFlows");

            migrationBuilder.RenameTable(
                name: "Users",
                newName: "users");

            migrationBuilder.RenameTable(
                name: "Transactions",
                newName: "transactions");

            migrationBuilder.RenameTable(
                name: "Snapshots",
                newName: "snapshots");

            migrationBuilder.RenameTable(
                name: "Accounts",
                newName: "accounts");

            migrationBuilder.RenameTable(
                name: "PlanTranches",
                newName: "plan_tranches");

            migrationBuilder.RenameTable(
                name: "EntryPlans",
                newName: "entry_plans");

            migrationBuilder.RenameTable(
                name: "CashFlows",
                newName: "cash_flows");

            migrationBuilder.RenameColumn(
                name: "Username",
                table: "users",
                newName: "username");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "users",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "PasswordHash",
                table: "users",
                newName: "password_hash");

            migrationBuilder.RenameColumn(
                name: "LastLoginAt",
                table: "users",
                newName: "last_login_at");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "users",
                newName: "created_at");

            migrationBuilder.RenameIndex(
                name: "IX_Users_Username",
                table: "users",
                newName: "ix_users_username");

            migrationBuilder.RenameColumn(
                name: "Symbol",
                table: "transactions",
                newName: "symbol");

            migrationBuilder.RenameColumn(
                name: "Side",
                table: "transactions",
                newName: "side");

            migrationBuilder.RenameColumn(
                name: "Quantity",
                table: "transactions",
                newName: "quantity");

            migrationBuilder.RenameColumn(
                name: "Price",
                table: "transactions",
                newName: "price");

            migrationBuilder.RenameColumn(
                name: "Fee",
                table: "transactions",
                newName: "fee");

            migrationBuilder.RenameColumn(
                name: "Currency",
                table: "transactions",
                newName: "currency");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "transactions",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "TradedOn",
                table: "transactions",
                newName: "traded_on");

            migrationBuilder.RenameColumn(
                name: "AccountId",
                table: "transactions",
                newName: "account_id");

            migrationBuilder.RenameIndex(
                name: "IX_Transactions_AccountId_TradedOn",
                table: "transactions",
                newName: "ix_transactions_account_id_traded_on");

            migrationBuilder.RenameColumn(
                name: "Note",
                table: "snapshots",
                newName: "note");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "snapshots",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "ValueThb",
                table: "snapshots",
                newName: "value_thb");

            migrationBuilder.RenameColumn(
                name: "NativeCurrency",
                table: "snapshots",
                newName: "native_currency");

            migrationBuilder.RenameColumn(
                name: "NativeAmount",
                table: "snapshots",
                newName: "native_amount");

            migrationBuilder.RenameColumn(
                name: "FxRateUsed",
                table: "snapshots",
                newName: "fx_rate_used");

            migrationBuilder.RenameColumn(
                name: "AsOfDate",
                table: "snapshots",
                newName: "as_of_date");

            migrationBuilder.RenameColumn(
                name: "AccountId",
                table: "snapshots",
                newName: "account_id");

            migrationBuilder.RenameIndex(
                name: "IX_Snapshots_AccountId_AsOfDate",
                table: "snapshots",
                newName: "ix_snapshots_account_id_as_of_date");

            migrationBuilder.RenameColumn(
                name: "Scope",
                table: "accounts",
                newName: "scope");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "accounts",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "Kind",
                table: "accounts",
                newName: "kind");

            migrationBuilder.RenameColumn(
                name: "Currency",
                table: "accounts",
                newName: "currency");

            migrationBuilder.RenameColumn(
                name: "Color",
                table: "accounts",
                newName: "color");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "accounts",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "IsArchived",
                table: "accounts",
                newName: "is_archived");

            migrationBuilder.RenameColumn(
                name: "DisplayOrder",
                table: "accounts",
                newName: "display_order");

            migrationBuilder.RenameColumn(
                name: "Quantity",
                table: "plan_tranches",
                newName: "quantity");

            migrationBuilder.RenameColumn(
                name: "Price",
                table: "plan_tranches",
                newName: "price");

            migrationBuilder.RenameColumn(
                name: "Filled",
                table: "plan_tranches",
                newName: "filled");

            migrationBuilder.RenameColumn(
                name: "Budget",
                table: "plan_tranches",
                newName: "budget");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "plan_tranches",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "PlanId",
                table: "plan_tranches",
                newName: "plan_id");

            migrationBuilder.RenameColumn(
                name: "FilledOn",
                table: "plan_tranches",
                newName: "filled_on");

            migrationBuilder.RenameColumn(
                name: "ActualQuantity",
                table: "plan_tranches",
                newName: "actual_quantity");

            migrationBuilder.RenameColumn(
                name: "ActualPrice",
                table: "plan_tranches",
                newName: "actual_price");

            migrationBuilder.RenameIndex(
                name: "IX_PlanTranches_PlanId",
                table: "plan_tranches",
                newName: "ix_plan_tranches_plan_id");

            migrationBuilder.RenameColumn(
                name: "Symbol",
                table: "entry_plans",
                newName: "symbol");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "entry_plans",
                newName: "status");

            migrationBuilder.RenameColumn(
                name: "Currency",
                table: "entry_plans",
                newName: "currency");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "entry_plans",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "PlanDate",
                table: "entry_plans",
                newName: "plan_date");

            migrationBuilder.RenameColumn(
                name: "AccountId",
                table: "entry_plans",
                newName: "account_id");

            migrationBuilder.RenameIndex(
                name: "IX_EntryPlans_AccountId",
                table: "entry_plans",
                newName: "ix_entry_plans_account_id");

            migrationBuilder.RenameColumn(
                name: "Note",
                table: "cash_flows",
                newName: "note");

            migrationBuilder.RenameColumn(
                name: "Direction",
                table: "cash_flows",
                newName: "direction");

            migrationBuilder.RenameColumn(
                name: "Currency",
                table: "cash_flows",
                newName: "currency");

            migrationBuilder.RenameColumn(
                name: "Amount",
                table: "cash_flows",
                newName: "amount");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "cash_flows",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "OccurredOn",
                table: "cash_flows",
                newName: "occurred_on");

            migrationBuilder.RenameColumn(
                name: "FxRateUsed",
                table: "cash_flows",
                newName: "fx_rate_used");

            migrationBuilder.RenameColumn(
                name: "CounterAccountId",
                table: "cash_flows",
                newName: "counter_account_id");

            migrationBuilder.RenameColumn(
                name: "AmountThb",
                table: "cash_flows",
                newName: "amount_thb");

            migrationBuilder.RenameColumn(
                name: "AccountId",
                table: "cash_flows",
                newName: "account_id");

            migrationBuilder.RenameIndex(
                name: "IX_CashFlows_OccurredOn",
                table: "cash_flows",
                newName: "ix_cash_flows_occurred_on");

            migrationBuilder.RenameIndex(
                name: "IX_CashFlows_CounterAccountId",
                table: "cash_flows",
                newName: "ix_cash_flows_counter_account_id");

            migrationBuilder.RenameIndex(
                name: "IX_CashFlows_AccountId_OccurredOn",
                table: "cash_flows",
                newName: "ix_cash_flows_account_id_occurred_on");

            migrationBuilder.AddPrimaryKey(
                name: "pk_users",
                table: "users",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_transactions",
                table: "transactions",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_snapshots",
                table: "snapshots",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_accounts",
                table: "accounts",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_plan_tranches",
                table: "plan_tranches",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_entry_plans",
                table: "entry_plans",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_cash_flows",
                table: "cash_flows",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_cash_flows_accounts_account_id",
                table: "cash_flows",
                column: "account_id",
                principalTable: "accounts",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_cash_flows_accounts_counter_account_id",
                table: "cash_flows",
                column: "counter_account_id",
                principalTable: "accounts",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_entry_plans_accounts_account_id",
                table: "entry_plans",
                column: "account_id",
                principalTable: "accounts",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_plan_tranches_entry_plans_plan_id",
                table: "plan_tranches",
                column: "plan_id",
                principalTable: "entry_plans",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_snapshots_accounts_account_id",
                table: "snapshots",
                column: "account_id",
                principalTable: "accounts",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_transactions_accounts_account_id",
                table: "transactions",
                column: "account_id",
                principalTable: "accounts",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_cash_flows_accounts_account_id",
                table: "cash_flows");

            migrationBuilder.DropForeignKey(
                name: "fk_cash_flows_accounts_counter_account_id",
                table: "cash_flows");

            migrationBuilder.DropForeignKey(
                name: "fk_entry_plans_accounts_account_id",
                table: "entry_plans");

            migrationBuilder.DropForeignKey(
                name: "fk_plan_tranches_entry_plans_plan_id",
                table: "plan_tranches");

            migrationBuilder.DropForeignKey(
                name: "fk_snapshots_accounts_account_id",
                table: "snapshots");

            migrationBuilder.DropForeignKey(
                name: "fk_transactions_accounts_account_id",
                table: "transactions");

            migrationBuilder.DropPrimaryKey(
                name: "pk_users",
                table: "users");

            migrationBuilder.DropPrimaryKey(
                name: "pk_transactions",
                table: "transactions");

            migrationBuilder.DropPrimaryKey(
                name: "pk_snapshots",
                table: "snapshots");

            migrationBuilder.DropPrimaryKey(
                name: "pk_accounts",
                table: "accounts");

            migrationBuilder.DropPrimaryKey(
                name: "pk_plan_tranches",
                table: "plan_tranches");

            migrationBuilder.DropPrimaryKey(
                name: "pk_entry_plans",
                table: "entry_plans");

            migrationBuilder.DropPrimaryKey(
                name: "pk_cash_flows",
                table: "cash_flows");

            migrationBuilder.RenameTable(
                name: "users",
                newName: "Users");

            migrationBuilder.RenameTable(
                name: "transactions",
                newName: "Transactions");

            migrationBuilder.RenameTable(
                name: "snapshots",
                newName: "Snapshots");

            migrationBuilder.RenameTable(
                name: "accounts",
                newName: "Accounts");

            migrationBuilder.RenameTable(
                name: "plan_tranches",
                newName: "PlanTranches");

            migrationBuilder.RenameTable(
                name: "entry_plans",
                newName: "EntryPlans");

            migrationBuilder.RenameTable(
                name: "cash_flows",
                newName: "CashFlows");

            migrationBuilder.RenameColumn(
                name: "username",
                table: "Users",
                newName: "Username");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Users",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "password_hash",
                table: "Users",
                newName: "PasswordHash");

            migrationBuilder.RenameColumn(
                name: "last_login_at",
                table: "Users",
                newName: "LastLoginAt");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Users",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "ix_users_username",
                table: "Users",
                newName: "IX_Users_Username");

            migrationBuilder.RenameColumn(
                name: "symbol",
                table: "Transactions",
                newName: "Symbol");

            migrationBuilder.RenameColumn(
                name: "side",
                table: "Transactions",
                newName: "Side");

            migrationBuilder.RenameColumn(
                name: "quantity",
                table: "Transactions",
                newName: "Quantity");

            migrationBuilder.RenameColumn(
                name: "price",
                table: "Transactions",
                newName: "Price");

            migrationBuilder.RenameColumn(
                name: "fee",
                table: "Transactions",
                newName: "Fee");

            migrationBuilder.RenameColumn(
                name: "currency",
                table: "Transactions",
                newName: "Currency");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Transactions",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "traded_on",
                table: "Transactions",
                newName: "TradedOn");

            migrationBuilder.RenameColumn(
                name: "account_id",
                table: "Transactions",
                newName: "AccountId");

            migrationBuilder.RenameIndex(
                name: "ix_transactions_account_id_traded_on",
                table: "Transactions",
                newName: "IX_Transactions_AccountId_TradedOn");

            migrationBuilder.RenameColumn(
                name: "note",
                table: "Snapshots",
                newName: "Note");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Snapshots",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "value_thb",
                table: "Snapshots",
                newName: "ValueThb");

            migrationBuilder.RenameColumn(
                name: "native_currency",
                table: "Snapshots",
                newName: "NativeCurrency");

            migrationBuilder.RenameColumn(
                name: "native_amount",
                table: "Snapshots",
                newName: "NativeAmount");

            migrationBuilder.RenameColumn(
                name: "fx_rate_used",
                table: "Snapshots",
                newName: "FxRateUsed");

            migrationBuilder.RenameColumn(
                name: "as_of_date",
                table: "Snapshots",
                newName: "AsOfDate");

            migrationBuilder.RenameColumn(
                name: "account_id",
                table: "Snapshots",
                newName: "AccountId");

            migrationBuilder.RenameIndex(
                name: "ix_snapshots_account_id_as_of_date",
                table: "Snapshots",
                newName: "IX_Snapshots_AccountId_AsOfDate");

            migrationBuilder.RenameColumn(
                name: "scope",
                table: "Accounts",
                newName: "Scope");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "Accounts",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "kind",
                table: "Accounts",
                newName: "Kind");

            migrationBuilder.RenameColumn(
                name: "currency",
                table: "Accounts",
                newName: "Currency");

            migrationBuilder.RenameColumn(
                name: "color",
                table: "Accounts",
                newName: "Color");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Accounts",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "is_archived",
                table: "Accounts",
                newName: "IsArchived");

            migrationBuilder.RenameColumn(
                name: "display_order",
                table: "Accounts",
                newName: "DisplayOrder");

            migrationBuilder.RenameColumn(
                name: "quantity",
                table: "PlanTranches",
                newName: "Quantity");

            migrationBuilder.RenameColumn(
                name: "price",
                table: "PlanTranches",
                newName: "Price");

            migrationBuilder.RenameColumn(
                name: "filled",
                table: "PlanTranches",
                newName: "Filled");

            migrationBuilder.RenameColumn(
                name: "budget",
                table: "PlanTranches",
                newName: "Budget");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "PlanTranches",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "plan_id",
                table: "PlanTranches",
                newName: "PlanId");

            migrationBuilder.RenameColumn(
                name: "filled_on",
                table: "PlanTranches",
                newName: "FilledOn");

            migrationBuilder.RenameColumn(
                name: "actual_quantity",
                table: "PlanTranches",
                newName: "ActualQuantity");

            migrationBuilder.RenameColumn(
                name: "actual_price",
                table: "PlanTranches",
                newName: "ActualPrice");

            migrationBuilder.RenameIndex(
                name: "ix_plan_tranches_plan_id",
                table: "PlanTranches",
                newName: "IX_PlanTranches_PlanId");

            migrationBuilder.RenameColumn(
                name: "symbol",
                table: "EntryPlans",
                newName: "Symbol");

            migrationBuilder.RenameColumn(
                name: "status",
                table: "EntryPlans",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "currency",
                table: "EntryPlans",
                newName: "Currency");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "EntryPlans",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "plan_date",
                table: "EntryPlans",
                newName: "PlanDate");

            migrationBuilder.RenameColumn(
                name: "account_id",
                table: "EntryPlans",
                newName: "AccountId");

            migrationBuilder.RenameIndex(
                name: "ix_entry_plans_account_id",
                table: "EntryPlans",
                newName: "IX_EntryPlans_AccountId");

            migrationBuilder.RenameColumn(
                name: "note",
                table: "CashFlows",
                newName: "Note");

            migrationBuilder.RenameColumn(
                name: "direction",
                table: "CashFlows",
                newName: "Direction");

            migrationBuilder.RenameColumn(
                name: "currency",
                table: "CashFlows",
                newName: "Currency");

            migrationBuilder.RenameColumn(
                name: "amount",
                table: "CashFlows",
                newName: "Amount");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "CashFlows",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "occurred_on",
                table: "CashFlows",
                newName: "OccurredOn");

            migrationBuilder.RenameColumn(
                name: "fx_rate_used",
                table: "CashFlows",
                newName: "FxRateUsed");

            migrationBuilder.RenameColumn(
                name: "counter_account_id",
                table: "CashFlows",
                newName: "CounterAccountId");

            migrationBuilder.RenameColumn(
                name: "amount_thb",
                table: "CashFlows",
                newName: "AmountThb");

            migrationBuilder.RenameColumn(
                name: "account_id",
                table: "CashFlows",
                newName: "AccountId");

            migrationBuilder.RenameIndex(
                name: "ix_cash_flows_occurred_on",
                table: "CashFlows",
                newName: "IX_CashFlows_OccurredOn");

            migrationBuilder.RenameIndex(
                name: "ix_cash_flows_counter_account_id",
                table: "CashFlows",
                newName: "IX_CashFlows_CounterAccountId");

            migrationBuilder.RenameIndex(
                name: "ix_cash_flows_account_id_occurred_on",
                table: "CashFlows",
                newName: "IX_CashFlows_AccountId_OccurredOn");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Users",
                table: "Users",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Transactions",
                table: "Transactions",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Snapshots",
                table: "Snapshots",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Accounts",
                table: "Accounts",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PlanTranches",
                table: "PlanTranches",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_EntryPlans",
                table: "EntryPlans",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CashFlows",
                table: "CashFlows",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CashFlows_Accounts_AccountId",
                table: "CashFlows",
                column: "AccountId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CashFlows_Accounts_CounterAccountId",
                table: "CashFlows",
                column: "CounterAccountId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EntryPlans_Accounts_AccountId",
                table: "EntryPlans",
                column: "AccountId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PlanTranches_EntryPlans_PlanId",
                table: "PlanTranches",
                column: "PlanId",
                principalTable: "EntryPlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Snapshots_Accounts_AccountId",
                table: "Snapshots",
                column: "AccountId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Accounts_AccountId",
                table: "Transactions",
                column: "AccountId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
