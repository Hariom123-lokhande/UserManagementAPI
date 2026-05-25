using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UserManagementAPI.Migrations
{
    public partial class CreateUserProfilesTableAndAuditFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "system");

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "Users",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "AuthUsers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "system");

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "AuthUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "AuthUsers",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "AuthUsers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "AuthUsers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "UserProfiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ProfileImagePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProfileImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProfileImageType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserProfiles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserProfiles_UserId",
                table: "UserProfiles",
                column: "UserId",
                unique: true);

            migrationBuilder.Sql(@"
                INSERT INTO UserProfiles (UserId, ProfileImagePath, ProfileImageUrl, ProfileImageType, CreatedBy, CreatedDate, IsDeleted)
                SELECT Id, ProfileImagePath, ProfileImageUrl, ProfileImageType, 'system', GETUTCDATE(), 0
                FROM Users
                WHERE ProfileImagePath IS NOT NULL OR ProfileImageUrl IS NOT NULL;
            ");

            migrationBuilder.DropColumn(name: "ProfileImagePath", table: "Users");
            migrationBuilder.DropColumn(name: "ProfileImageUrl", table: "Users");
            migrationBuilder.DropColumn(name: "ProfileImageType", table: "Users");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProfileImagePath",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfileImageUrl",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfileImageType",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE u
                SET
                    u.ProfileImagePath = p.ProfileImagePath,
                    u.ProfileImageUrl = p.ProfileImageUrl,
                    u.ProfileImageType = p.ProfileImageType
                FROM Users u
                INNER JOIN UserProfiles p ON p.UserId = u.Id;
            ");

            migrationBuilder.DropTable(name: "UserProfiles");

            migrationBuilder.DropColumn(name: "CreatedBy", table: "Users");
            migrationBuilder.DropColumn(name: "UpdatedBy", table: "Users");
            migrationBuilder.DropColumn(name: "CreatedDate", table: "Users");
            migrationBuilder.DropColumn(name: "UpdatedDate", table: "Users");
            migrationBuilder.DropColumn(name: "IsDeleted", table: "Users");

            migrationBuilder.DropColumn(name: "CreatedBy", table: "AuthUsers");
            migrationBuilder.DropColumn(name: "UpdatedBy", table: "AuthUsers");
            migrationBuilder.DropColumn(name: "CreatedDate", table: "AuthUsers");
            migrationBuilder.DropColumn(name: "UpdatedDate", table: "AuthUsers");
            migrationBuilder.DropColumn(name: "IsDeleted", table: "AuthUsers");
        }
    }
}
