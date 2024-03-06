using Microsoft.AspNetCore.Mvc;
using System.Net.Mail;
using System.Security.Cryptography;
using MySqlConnector;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Net;
using Project_team2;
namespace Project2.Controllers

{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly string _connString;
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly string _telegramBotToken;
        private readonly long _chatId;
        public AuthController()
        {
            _connString = Config.MySqlConnection;
            _smtpServer = Config.SmtpServer;
            _smtpPort = Config.SmtpPort;
            _smtpUsername = Config.SmtpUsername;
            _smtpPassword = Config.SmtpPassword;
            _telegramBotToken = Config.TelegramBotToken;
            _chatId = Config.ChatId;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            try
            {
                await using var connection = new MySqlConnection(_connString);
                await connection.OpenAsync();

                var query = "SELECT * FROM Users WHERE LOWER(Login) = LOWER(@name) OR LOWER(Email) = LOWER(@Ename)";
                await using (var command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@name", model.Login);
                    command.Parameters.AddWithValue("@Ename", model.Email);

                    await using (var reader = await command.ExecuteReaderAsync())
                    {
                        var notificationsAdvices = false;
                        var notificationsHelp = false;
                        var notificationsRemind = false;

                        if (await reader.ReadAsync())
                        {
                            var storedHash = reader["password"].ToString();
                            var userId = reader["Id"].ToString();
                            var isAdmin = Convert.ToBoolean(reader["IsAdmin"]);

                            var userProfile = new UserProfile(reader);
                            notificationsAdvices = Convert.ToBoolean(reader["NotificationsAdvices"]);
                            notificationsHelp = Convert.ToBoolean(reader["NotificationsHelp"]);
                            notificationsRemind = Convert.ToBoolean(reader["NotificationsRemind"]);
                            reader.Close();

                            if (BCrypt.Net.BCrypt.Verify(model.Password, storedHash))
                            {
                                var updateQuery = "UPDATE Users SET LastLogin = @LastLogin WHERE Id = @UserId";
                                await using (var updateCommand = new MySqlCommand(updateQuery, connection))
                                {
                                    updateCommand.Parameters.AddWithValue("@LastLogin", DateTime.UtcNow);
                                    updateCommand.Parameters.AddWithValue("@UserId", userId);
                                    await updateCommand.ExecuteNonQueryAsync();
                                    // Получаем информацию об уведомлениях из базы данных
                                   
                                }

                                userProfile.LastLogin = DateTime.UtcNow.ToString();

                                

                                // Создаем объект JSON, содержащий все необходимые данные
                                var response = new
                                {
                                    message = "Authentication successful",
                                    user = userProfile,
                                    token = GenerateJwtToken(userId),
                                   
                                    notifications = new
                                    {
                                        advices = notificationsAdvices,
                                        help = notificationsHelp,
                                        remind = notificationsRemind
                                    }
                                };

                                await NotifyTelegramChatLogin(userProfile);

                                return Ok(response);
                            }
                            else
                            {
                                return Unauthorized(new { message = "Invalid credentials" });
                            }
                        }
                        else
                        {
                            return Unauthorized(new { message = "User not found" }); // Добавленный возврат значения
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка в методе Login: {ex.ToString()}");
                return StatusCode(500, new { message = $"Внутренняя ошибка сервера. Исключение: {ex.Message}" });
            }
        }

        private string GenerateJwtToken(string userId)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            byte[] key = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(key);
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim("UserId", userId),
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private async Task NotifyTelegramChatLogin(UserProfile userProfile)
        {
            try
            {
                using (HttpClient client = new HttpClient())
                {
                    string message = $"User Connected:\nName: {userProfile.Login}\nIP: {HttpContext.Connection.RemoteIpAddress}\nBrowser: {HttpContext.Request.Headers["User-Agent"]}\nTimeStamp: {DateTime.UtcNow}";

                    string apiUrl = $"https://api.telegram.org/bot6693790489:AAHzRPq9DZzY_mfRoyqYZm6_Z0q9nkCHqIk/sendMessage?chat_id={_chatId}&text={message}";
                    await client.GetStringAsync(apiUrl);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка отправки уведомления в чат Telegram: {ex.ToString()}");
            }
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterModel model)
        {
            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    string query = "INSERT INTO Users (Login, Email, Password, Phone,RegistrationTime) " +
                                   "VALUES (@login, @email,@password, @phone, @registrationTime)";

                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {

                        command.Parameters.AddWithValue("@login", model.Login);
                        command.Parameters.AddWithValue("@email", model.Email);
                        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(model.Password);
                        command.Parameters.AddWithValue("@password", hashedPassword);
                        command.Parameters.AddWithValue("@phone", model.Phone);

                        command.Parameters.AddWithValue("@registrationTime", DateTime.UtcNow);

                        int rowsAffected = command.ExecuteNonQuery();

                        if (rowsAffected > 0)
                        {
                            NotifyTelegramChatRegister(model.Login, model.Email);
                            return Ok(new { message = "Registration successful" });
                        }
                        else
                        {
                            return BadRequest(new { message = "Registration failed" });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка в методе Register: {ex.ToString()}");
                return StatusCode(500, new { message = $"Внутренняя ошибка сервера. Исключение: {ex.Message}" });
            }
        }

        private async Task NotifyTelegramChatRegister(string Username, string Email)
        {
            try
            {
                using (HttpClient client = new HttpClient())
                {
                    string message = $"User Registration:\nName: {Username}\nEmail: {Email}\nIP: {HttpContext.Connection.RemoteIpAddress}\nBrowser: {HttpContext.Request.Headers["User-Agent"]}\nTimeStamp: {DateTime.UtcNow}";

                    string apiUrl = $"https://api.telegram.org/bot6693790489:AAHzRPq9DZzY_mfRoyqYZm6_Z0q9nkCHqIk/sendMessage?chat_id={_chatId}&text={message}";
                    await client.GetStringAsync(apiUrl);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка отправки уведомления в чат Telegram: {ex.ToString()}");
            }
        }

        [HttpPost("send_verification_code")]
        public IActionResult SendVerificationCode([FromBody] EmailModel model)
        {
            try
            {
                string verificationCode = GenerateVerificationCode();
                SendEmail(model.Email, "Код верификации", $"Ваш код верификации: {verificationCode}");
                return Ok(new { verificationCode });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка в методе SendVerificationCode: {ex.ToString()}");
                return StatusCode(500, new { message = $"Внутренняя ошибка сервера. Исключение: {ex.Message}" });
            }
        }

        private string GenerateVerificationCode()
        {
            Random random = new Random();
            return random.Next(100000, 999999).ToString();
        }

        private void SendEmail(string toEmail, string subject, string body)
        {
            using (SmtpClient smtpClient = new SmtpClient(_smtpServer, _smtpPort))
            {
                smtpClient.UseDefaultCredentials = false;
                smtpClient.Credentials = new NetworkCredential(_smtpUsername, _smtpPassword);
                smtpClient.EnableSsl = true;

                using (MailMessage mailMessage = new MailMessage())
                {
                    mailMessage.From = new MailAddress(_smtpUsername);
                    mailMessage.To.Add(toEmail);
                    mailMessage.Subject = subject;
                    mailMessage.Body = body;
                    mailMessage.IsBodyHtml = false;

                    smtpClient.Send(mailMessage);
                }
            }
        }
    }

    public class LoginModel
    {
        public string Login { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class RegisterModel
    {

        public string Login { get; set; }
        public string Email { get; set; }

        public string Password { get; set; }
        public string Phone { get; set; }

    }

    public class EmailModel
    {
        public string Email { get; set; }
    }
}
