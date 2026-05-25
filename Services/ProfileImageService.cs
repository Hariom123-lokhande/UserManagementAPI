using UserManagementAPI.Models;

namespace UserManagementAPI.Services
{
    public class ProfileImageService : IProfileImageService
    {
        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        private const long MaxFileSizeBytes = 5 * 1024 * 1024;
        private readonly string _uploadsRoot;
        private readonly string _profileFolder;

        public ProfileImageService(IWebHostEnvironment environment)
        {
            _uploadsRoot = Path.Combine(environment.ContentRootPath, "uploads");
            _profileFolder = Path.Combine(_uploadsRoot, "profile");
            Directory.CreateDirectory(_profileFolder);
        }

        public bool IsValidImage(IFormFile file, out string? errorMessage)
        {
            errorMessage = null;

            if (file == null || file.Length == 0)
            {
                errorMessage = "Please select an image file.";
                return false;
            }

            if (file.Length > MaxFileSizeBytes)
            {
                errorMessage = "Image must be 5 MB or smaller.";
                return false;
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
            {
                errorMessage = "Only JPG, PNG, GIF, and WEBP images are allowed.";
                return false;
            }

            return true;
        }

        public string GetImageType(IFormFile file)
        {
            if (!string.IsNullOrWhiteSpace(file.ContentType) && file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            {
                return file.ContentType;
            }

            return Path.GetExtension(file.FileName).ToLowerInvariant() switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".webp" => "image/webp",
                _ => "application/octet-stream"
            };
        }

        public async Task<ProfileImageResult> SaveProfileImageAsync(int userId, IFormFile file, string requestBaseUrl)
        {
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var fileName = $"user_{userId}_{Guid.NewGuid():N}{extension}";
            var relativePath = $"profile/{fileName}";
            var fullPath = Path.Combine(_profileFolder, fileName);

            await using var stream = new FileStream(fullPath, FileMode.Create);
            await file.CopyToAsync(stream);

            var baseUrl = requestBaseUrl.TrimEnd('/');
            return new ProfileImageResult
            {
                RelativePath = relativePath,
                ImageUrl = $"{baseUrl}/uploads/{relativePath}",
                ImageType = GetImageType(file)
            };
        }

        public void DeleteProfileImage(string? relativePath)
        {
            if (string.IsNullOrWhiteSpace(relativePath))
            {
                return;
            }

            var fullPath = Path.Combine(_uploadsRoot, relativePath.Replace('/', Path.DirectorySeparatorChar));
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }
    }
}
