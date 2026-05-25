namespace UserManagementAPI.Services
{
    public class SystemCurrentUserService : ICurrentUserService
    {
        public string GetCurrentUserName() => "system";
    }
}
