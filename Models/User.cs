namespace UserManagementAPI.Models
{
    public class User : BaseAuditableEntity
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public int Age { get; set; }

        public UserProfile? Profile { get; set; }
    }
}
