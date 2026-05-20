using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        // Request classes to read JSON data from the frontend form
        public class LoginRequest { public string Username { get; set; } = ""; public string Password { get; set; } = ""; }
        public class ResetRequest { public string Username { get; set; } = ""; public string SecurityAnswer { get; set; } = ""; public string NewPassword { get; set; } = ""; }

        // 1. LOGIN ENDPOINT (api/auth/login)
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest req)
        {
            if (req.Username == "admin" && req.Password == "admin123") {
                return Ok(new { success = true, message = "Welcome!" });
            }
            return BadRequest(new { success = false, message = "Invalid Username or Password!" });
        }

        // 2. FORGOT PASSWORD ENDPOINT (api/auth/forgot-password)
        [HttpPost("forgot-password")]
        public IActionResult ForgotPassword([FromBody] ResetRequest req)
        {
            if (req.Username == "admin" && req.SecurityAnswer.ToLower() == "st. joseph") {
                return Ok(new { success = true, message = "Password updated successfully!" });
            }
            return BadRequest(new { success = false, message = "Security verification failed." });
        }
    }
}