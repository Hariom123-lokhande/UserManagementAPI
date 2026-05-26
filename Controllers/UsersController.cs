using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserManagementAPI.Data;
using UserManagementAPI.Models;
using UserManagementAPI.Services;

namespace UserManagementAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IProfileImageService _profileImageService;

        public UsersController(AppDbContext context, IProfileImageService profileImageService)
        {
            _context = context;
            _profileImageService = profileImageService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers(int page = 1, int pageSize = 7, string searchTerm = "")
        {
            var query = _context.Users
                .Include(u => u.Profile)
                .AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(u => u.Name.Contains(searchTerm) || u.Email.Contains(searchTerm));
            }

            var totalCount = await query.CountAsync();
            var users = await query
                .OrderBy(u => u.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                Users = users.Select(UserResponseDto.FromUser),
                TotalCount = totalCount
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponseDto>> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound();
            }

            return UserResponseDto.FromUser(user);
        }

        [HttpPost]
        public async Task<ActionResult<UserResponseDto>> AddUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(UserResponseDto.FromUser(user));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, User user)
        {
            if (id != user.Id)
            {
                return BadRequest();
            }

            var existingUser = await _context.Users.FindAsync(id);
            if (existingUser == null)
            {
                return NotFound();
            }

            existingUser.Name = user.Name;
            existingUser.Email = user.Email;
            existingUser.Age = user.Age;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/profile-image")]
        public async Task<IActionResult> UploadProfileImage(int id, IFormFile file)
        {
            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            if (!_profileImageService.IsValidImage(file, out var errorMessage))
            {
                return BadRequest(new { message = errorMessage });
            }

            var profile = user.Profile ?? new UserProfile { UserId = id };
            if (user.Profile == null)
            {
                _context.UserProfiles.Add(profile);
            }

            _profileImageService.DeleteProfileImage(profile.ProfileImagePath);

            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var imageResult = await _profileImageService.SaveProfileImageAsync(id, file, baseUrl);

            profile.ProfileImagePath = imageResult.RelativePath;
            profile.ProfileImageUrl = imageResult.ImageUrl;
            profile.ProfileImageType = imageResult.ImageType;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                profileImagePath = profile.ProfileImagePath,
                profileImageUrl = profile.ProfileImageUrl,
                profileImageType = profile.ProfileImageType
            });
        }

        [HttpDelete("{id}/profile-image")]
        public async Task<IActionResult> DeleteProfileImage(int id)
        {
            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            if (user.Profile == null || string.IsNullOrWhiteSpace(user.Profile.ProfileImagePath))
            {
                return NoContent();
            }

            _profileImageService.DeleteProfileImage(user.Profile.ProfileImagePath);
            user.Profile.ProfileImagePath = null;
            user.Profile.ProfileImageUrl = null;
            user.Profile.ProfileImageType = null;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound();
            }

            if (user.Profile != null)
            {
                _profileImageService.DeleteProfileImage(user.Profile.ProfileImagePath);
                user.Profile.IsDeleted = true;
            }

            user.IsDeleted = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
