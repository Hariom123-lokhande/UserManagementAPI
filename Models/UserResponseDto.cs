namespace UserManagementAPI.Models
{
    public class UserResponseDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public int Age { get; set; }

        public string? ProfileImagePath { get; set; }

        public string? ProfileImageUrl { get; set; }

        public string? ProfileImageType { get; set; }

        public string CreatedBy { get; set; } = string.Empty;

        public string? UpdatedBy { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsDeleted { get; set; }

        public static UserResponseDto FromUser(User user)
        {
            return new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Age = user.Age,
                ProfileImagePath = user.Profile?.ProfileImagePath,
                ProfileImageUrl = user.Profile?.ProfileImageUrl,
                ProfileImageType = user.Profile?.ProfileImageType,
                CreatedBy = user.CreatedBy,
                UpdatedBy = user.UpdatedBy,
                CreatedDate = user.CreatedDate,
                UpdatedDate = user.UpdatedDate,
                IsDeleted = user.IsDeleted
            };
        }
    }
}
