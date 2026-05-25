using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserManagementAPI.Data;
using UserManagementAPI.Models;
using UserManagementAPI.Services;

namespace UserManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        private readonly TokenService _tokenService;

        private readonly PasswordHasher<AuthUser> _passwordHasher;

        public AuthController(
            AppDbContext context,
            TokenService tokenService
        )
        {
            _context = context;

            _tokenService = tokenService;

            _passwordHasher = new PasswordHasher<AuthUser>();
        }

        // REGISTER API
        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var existingUser = await _context.AuthUsers
                .FirstOrDefaultAsync(
                    u => u.Email == request.Email
                );

            if (existingUser != null)
            {
                return BadRequest(new
                {
                    Message = "Email Already Exists"
                });
            }

            var user = new AuthUser
            {
                Email = request.Email
            };

            user.PasswordHash = _passwordHasher
                .HashPassword(user, request.Password);

            _context.AuthUsers.Add(user);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Registration Successful"
            });
        }

        // LOGIN API
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var user = await _context.AuthUsers
                .FirstOrDefaultAsync(
                    u => u.Email == request.Email
                );

            if (user == null)
            {
                return Unauthorized(new
                {
                    Message = "Invalid Email Or Password"
                });
            }

            var result = _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password
            );

            if (result == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new
                {
                    Message = "Invalid Email Or Password"
                });
            }

            var token = _tokenService.GenerateToken(user);

            var response = new LoginResponse
            {
                Token = token,
                Message = "Login Successful"
            };

            return Ok(response);
        }
    }
}