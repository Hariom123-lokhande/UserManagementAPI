using UserManagementAPI.Models;

namespace UserManagementAPI.Services
{
    public interface IProfileImageService
    {
        bool IsValidImage(IFormFile file, out string? errorMessage);
        Task<ProfileImageResult> SaveProfileImageAsync(int userId, IFormFile file, string requestBaseUrl);
        void DeleteProfileImage(string? relativePath);
        string GetImageType(IFormFile file);
    }
}
