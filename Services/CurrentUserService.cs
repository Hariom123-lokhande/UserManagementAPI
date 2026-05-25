using System.Security.Claims;

namespace UserManagementAPI.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string GetCurrentUserName()
        {
            var email = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Email)
                ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Name);

            return string.IsNullOrWhiteSpace(email) ? "system" : email;
        }
    }
}
