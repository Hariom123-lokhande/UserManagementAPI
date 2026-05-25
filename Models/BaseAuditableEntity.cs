namespace UserManagementAPI.Models
{
    public abstract class BaseAuditableEntity
    {
        public string CreatedBy { get; set; } = "system";

        public string? UpdatedBy { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsDeleted { get; set; }
    }
}
