using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Project_team2;


namespace Project_team2.Controllers
{
    [ApiController]
    [Route("api/google/auth")]
    public class GoogleController : ControllerBase
    {
        [HttpGet]
        [Route("signin")]
        public IActionResult SignIn()
        {
            var authenticationProperties = new AuthenticationProperties { RedirectUri = Url.Action(nameof(HandleCallback)) };
            return Challenge(authenticationProperties, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet]
        [Route("callback")]
        public async Task<IActionResult> HandleCallback()
        {
            var authenticateResult = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            if (!authenticateResult.Succeeded)
                return BadRequest(); // Handle error.

            // Here you can extract user information from authenticateResult and create/use a user in your system
            // For simplicity, let's redirect to the client application
            return Redirect("http://localhost:3000"); // Redirect to your React application
        }
    }
}
