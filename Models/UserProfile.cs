namespace UserManagementAPI.Models
{
    public class UserProfile : BaseAuditableEntity
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public string? ProfileImagePath { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? ProfileImageType { get; set; }
    }
}
