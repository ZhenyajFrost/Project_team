using Microsoft.AspNetCore.Mvc;
using System.Net.Mail;
using System.Security.Cryptography;
using MySqlConnector;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Net;
using Project_team2;
using System.Text;
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
                        var likedLotIds = new List<int>(); // Массив для хранения идентификаторов лотов, на которые пользователь поставил лайк

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
                                var getSubscribedUsersQuery = @"
            SELECT SubscribedToId
            FROM UsersSubscribe
            WHERE SubscriberId = @userId";

                                var subscribedUserIds = new List<int>();

                                await using (var getSubscribedUsersCommand = new MySqlCommand(getSubscribedUsersQuery, connection))
                                {
                                    getSubscribedUsersCommand.Parameters.AddWithValue("@userId", userId);
                                    await using (var subscribedUsersReader = await getSubscribedUsersCommand.ExecuteReaderAsync())
                                    {
                                        while (await subscribedUsersReader.ReadAsync())
                                        {
                                            var subscribedUserId = subscribedUsersReader.GetInt32("SubscribedToId");
                                            subscribedUserIds.Add(subscribedUserId);
                                        }
                                    }
                                }
                                // Запрос на получение идентификаторов лотов, на которые пользователь поставил лайк
                                var getLikedLotsQuery = "SELECT LotId FROM LikedLots WHERE UserId = @UserId";
                                await using (var getLikedLotsCommand = new MySqlCommand(getLikedLotsQuery, connection))
                                {
                                    getLikedLotsCommand.Parameters.AddWithValue("@UserId", userId);
                                    await using (var likedLotsReader = await getLikedLotsCommand.ExecuteReaderAsync())
                                    {
                                        while (await likedLotsReader.ReadAsync())
                                        {
                                            likedLotIds.Add(likedLotsReader.GetInt32("LotId"));
                                        }
                                    }
                                }

                                userProfile.LastLogin = DateTime.UtcNow.ToString();

                                // Создаем объект JSON, содержащий все необходимые данные, включая массив идентификаторов лотов, на которые пользователь поставил лайк
                                var response = new
                                {
                                    message = "Authentication successful",
                                    user = userProfile,
                                    token = GenerateJwtToken(userId),
                                    likedLotIds,
                                    subscribedUserIds,
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
                            return Unauthorized(new { message = "User not found" });
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
        [HttpPost("register/google")]
        public IActionResult RegisterOrLoginWithGoogle([FromBody] GoogleRegisterModel model)
        {
            var notificationsAdvices = false;
            var notificationsHelp = false;
            var notificationsRemind = false;
            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Проверяем, существует ли пользователь с таким Google Id
                    if (!string.IsNullOrEmpty(model.GoogleId))
                    {
                        string checkQuery = "SELECT * FROM Users WHERE GoogleId = @googleId";
                        using (MySqlCommand checkCommand = new MySqlCommand(checkQuery, connection))
                        {
                            checkCommand.Parameters.AddWithValue("@googleId", model.GoogleId);
                            using (MySqlDataReader reader = checkCommand.ExecuteReader())
                            {
                                if (reader.Read()) // Если пользователь существует, выполняем логинизацию
                                {
                                    var userId = reader["Id"].ToString();
                                    Console.WriteLine($"UserId: {userId}");

                                    notificationsAdvices = Convert.ToBoolean(reader["NotificationsAdvices"]);
                                    notificationsHelp = Convert.ToBoolean(reader["NotificationsHelp"]);
                                    notificationsRemind = Convert.ToBoolean(reader["NotificationsRemind"]);
                                    reader.Close();

                                    // Обновляем LastLogin для существующего пользователя
                                    UpdateLastLogin(connection, userId);
                                    Console.WriteLine("Last login updated");

                                    // Получаем профиль пользователя
                                    var userProfile = GetUserProfile(connection, userId);
                                    Console.WriteLine($"User profile: {userProfile}");

                                    // Получаем идентификаторы подписанных пользователей
                                    var subscribedUserIds = GetSubscribedUserIds(connection, userId);
                                    Console.WriteLine($"Subscribed user ids: {string.Join(", ", subscribedUserIds)}");

                                    // Получаем идентификаторы лотов, на которые пользователь поставил лайк
                                    var likedLotIds = GetLikedLotIds(connection, userId);
                                    Console.WriteLine($"Liked lot ids: {string.Join(", ", likedLotIds)}");

                                    // Создаем JWT токен
                                    var token = GenerateJwtToken(userId);
                                    Console.WriteLine($"JWT token: {token}");
                                    var updateQuery = "UPDATE Users SET LastLogin = @LastLogin WHERE Id = @UserId";
                                     using (var updateCommand = new MySqlCommand(updateQuery, connection))
                                    {
                                        updateCommand.Parameters.AddWithValue("@LastLogin", DateTime.UtcNow);
                                        updateCommand.Parameters.AddWithValue("@UserId", userId);
                                        updateCommand.ExecuteNonQueryAsync();
                                        // Получаем информацию об уведомлениях из базы данных

                                    }
                                    // Создаем объект JSON с данными пользователя и дополнительными данными
                                    var response = new
                                    {
                                        message = "Login successful",
                                        user = userProfile,
                                        token,
                                        likedLotIds,
                                        subscribedUserIds,
                                        notifications = new
                                        {
                                            advices = notificationsAdvices,
                                            help = notificationsHelp,
                                            remind = notificationsRemind
                                        }
                                    };

                                    return Ok(response);
                                }
                            }
                        }
                    }

                    // Если пользователь не существует, выполняем регистрацию
                    string TempPass;
                    string query = "INSERT INTO Users (Login, Email, Avatar, RegistrationTime, Password";

                    // Добавляем GoogleId в запрос, если он указан
                    if (!string.IsNullOrEmpty(model.GoogleId))
                    {
                        query += ", GoogleId";
                    }

                    // Добавляем GivenName и FamilyName в запрос, если они переданы
                    if (!string.IsNullOrEmpty(model.GivenName))
                    {
                        query += ", FirstName";
                    }
                    if (!string.IsNullOrEmpty(model.FamilyName))
                    {
                        query += ", LastName";
                    }

                    query += ") VALUES (@email, @email, @avatar, @registrationTime, @password";
                    // Добавляем значение GoogleId в запрос, если оно указано
                    if (!string.IsNullOrEmpty(model.GoogleId))
                    {
                        query += ", @googleId";
                    }
                    // Добавляем значения для GivenName и FamilyName, если они переданы
                    if (!string.IsNullOrEmpty(model.GivenName))
                    {
                        query += ", @firstName";
                    }
                    if (!string.IsNullOrEmpty(model.FamilyName))
                    {
                        query += ", @lastName";
                    }



                    query += ");";

                    // Добавляем параметры к команде
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        // Добавляем параметры к команде
                        command.Parameters.AddWithValue("@email", model.Email);
                        command.Parameters.AddWithValue("@avatar", model.ImageUrl); // Сохраняем ссылку на аватар
                        command.Parameters.AddWithValue("@registrationTime", DateTime.UtcNow); // Получаем текущее время сервера
                        TempPass = GenerateTemporaryPassword();
                        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(TempPass);
                        command.Parameters.AddWithValue("@password", hashedPassword);
                        Console.WriteLine($"Parameters: Email={model.Email}, Avatar={model.ImageUrl}, RegistrationTime={DateTime.UtcNow}");

                        // Добавляем значения для GivenName и FamilyName, если они переданы
                        if (!string.IsNullOrEmpty(model.GivenName))
                        {
                            command.Parameters.AddWithValue("@firstName", model.GivenName);
                        }
                        if (!string.IsNullOrEmpty(model.FamilyName))
                        {
                            command.Parameters.AddWithValue("@lastName", model.FamilyName);
                        }

                        // Добавляем значение GoogleId в параметры, если оно указано
                        if (!string.IsNullOrEmpty(model.GoogleId))
                        {
                            command.Parameters.AddWithValue("@googleId", model.GoogleId);
                        }

                        int rowsAffected = command.ExecuteNonQuery();
                        Console.WriteLine($"Rows affected: {rowsAffected}");
                        if (rowsAffected > 0)
                        {
                            // Получаем Id нового пользователя
                            string newUserId = command.LastInsertedId.ToString();
                            Console.WriteLine($"New user id: {newUserId}");

                            // Обновляем LastLogin для нового пользователя
                            UpdateLastLogin(connection, newUserId);
                            Console.WriteLine("Last login updated");

                            // Получаем профиль нового пользователя
                            var userProfile = GetUserProfile(connection, newUserId);
                            Console.WriteLine($"User profile: {userProfile}");

                            // Создаем JWT токен
                            var token = GenerateJwtToken(newUserId);
                            Console.WriteLine($"JWT token: {token}");

                            // Создаем объект JSON с данными пользователя и дополнительными данными
                        
                            var response = new
                            {
                                message = "Registration successful",
                                user = userProfile,
                                token
                            };
                            string mess = $"Здравствуйте, ваш временный пароль указан ниже. Смените его при первой возможности в целях безопасности. " +
                                "Пароль:" + TempPass;
                            SendEmail(model.Email, "Временный пароль", mess);

                            return Ok(response);
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
                Console.WriteLine($"Error in RegisterOrLoginWithGoogle method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal server error. Exception: {ex.Message}" });
            }
        }
        private string GenerateTemporaryPassword()
        {
            const string validChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()-_=+";
            Random random = new Random();
            StringBuilder password = new StringBuilder();

            // Добавляем случайные символы в пароль
            for (int i = 0; i < 8; i++)
            {
                password.Append(validChars[random.Next(validChars.Length)]);
            }

            // Убедимся, что пароль содержит хотя бы одну большую букву и один специальный символ
            if (!password.ToString().Any(char.IsUpper))
            {
                // Добавляем случайную большую букву в пароль
                password[random.Next(0, 7)] = validChars[random.Next(26, 52)];
            }
            if (!password.ToString().Any(char.IsSymbol))
            {
                // Добавляем случайный специальный символ в пароль
                password[random.Next(0, 7)] = validChars[random.Next(52, validChars.Length)];
            }

            return password.ToString();
        }
        // Метод для обновления времени последнего входа пользователя
        private void UpdateLastLogin(MySqlConnection connection, string userId)
        {
            string updateQuery = "UPDATE Users SET LastLogin = @LastLogin WHERE Id = @UserId";
            using (MySqlCommand updateCommand = new MySqlCommand(updateQuery, connection))
            {
                updateCommand.Parameters.AddWithValue("@LastLogin", DateTime.UtcNow);
                updateCommand.Parameters.AddWithValue("@UserId", userId);
                updateCommand.ExecuteNonQuery();
            }
        }

        // Метод для получения профиля пользователя
        private object GetUserProfile(MySqlConnection connection, string userId)
        {
            var query = "SELECT * FROM Users WHERE Id = @UserId";
            using (MySqlCommand command = new MySqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@UserId", userId);
                using (MySqlDataReader reader = command.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        return new UserProfile(reader);
                    }
                    else
                    {
                        return null;
                    }
                }
            }
        }

        // Метод для получения идентификаторов подписанных пользователей
        private List<int> GetSubscribedUserIds(MySqlConnection connection, string userId)
        {
            var subscribedUserIds = new List<int>();
            var query = "SELECT SubscribedToId FROM UsersSubscribe WHERE SubscriberId = @UserId";
            using (MySqlCommand command = new MySqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@UserId", userId);
                using (MySqlDataReader reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        subscribedUserIds.Add(reader.GetInt32("SubscribedToId"));
                    }
                }
            }
            return subscribedUserIds;
        }

        // Метод для получения идентификаторов лотов, на которые пользователь поставил лайк
        private List<int> GetLikedLotIds(MySqlConnection connection, string userId)
        {
            var likedLotIds = new List<int>();
            var query = "SELECT LotId FROM LikedLots WHERE UserId = @UserId";
            using (MySqlCommand command = new MySqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@UserId", userId);
                using (MySqlDataReader reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        likedLotIds.Add(reader.GetInt32("LotId"));
                    }
                }
            }
            return likedLotIds;
        }





        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterModel model)
        {
            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    string query = "INSERT INTO Users (Login, Avatar,Email, Password, Phone,RegistrationTime) " +
                                   "VALUES (@login, @avatar @email,@password, @phone, @registrationTime)";

                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {

                        command.Parameters.AddWithValue("@login", model.Login);
                        command.Parameters.AddWithValue("@avatar", "http://res.cloudinary.com/ebayclone/image/upload/v1710431831/userAvatars/profile_png_w2cxsi.png");
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
    public class GoogleRegisterModel
    {
        public string? GivenName { get; set; } // Имя пользователя (полученное от Google)
        public string? FamilyName { get; set; } // Фамилия пользователя (полученная от Google)
        public string Email { get; set; } // Email пользователя (полученный от Google)
        public string GoogleId { get; set; } // Google Id пользователя (полученный от Google)
        public string ImageUrl { get; set; } // URL аватара пользователя (полученный от Google)
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
