using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using Newtonsoft.Json.Linq;
using Project_team2;
using System;
using System.IdentityModel.Tokens.Jwt;

namespace Project2.Controllers
{
    [Route("api/EditUser")]
    [ApiController]
    public class EditUserController : ControllerBase
    {
        private readonly string _connectionString;

        public EditUserController()
        {
            _connectionString = Config.MySqlConnection;
        }

        public string ExtractUserIdFromToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadToken(token) as JwtSecurityToken;

            if (jwtToken != null)
            {
                var userIdClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == "UserId");
                if (userIdClaim != null)
                {
                    return userIdClaim.Value;
                }
            }

            return null;
        }
        [HttpPost("toggleNotificationsAdvices")]
        public IActionResult ToggleNotificationsAdvices([FromBody] ToggleNotificationsModel model)
        {
            var userId = ExtractUserIdFromToken(model.Token);
            try
            {
               

                using (MySqlConnection connection = new MySqlConnection(_connectionString))
                {
                    connection.Open();

                    // Получаем текущее значение поля NotificationsAdvices для указанного пользователя
                    string getCurrentValueQuery = "SELECT NotificationsAdvices FROM Users WHERE Id = @userId";
                    using (MySqlCommand getCurrentValueCommand = new MySqlCommand(getCurrentValueQuery, connection))
                    {
                        getCurrentValueCommand.Parameters.AddWithValue("@userId", userId);
                        bool currentNotificationsAdvices = Convert.ToBoolean(getCurrentValueCommand.ExecuteScalar());

                        // Определяем новое значение для поля NotificationsAdvices (инвертирование текущего значения)
                        bool newNotificationsAdvices = !currentNotificationsAdvices;

                        // Обновляем поле NotificationsAdvices в базе данных
                        string updateNotificationsQuery = "UPDATE Users SET NotificationsAdvices = @newNotificationsAdvices WHERE Id = @userId";
                        using (MySqlCommand updateNotificationsCommand = new MySqlCommand(updateNotificationsQuery, connection))
                        {
                            updateNotificationsCommand.Parameters.AddWithValue("@newNotificationsAdvices", newNotificationsAdvices);
                            updateNotificationsCommand.Parameters.AddWithValue("@userId", userId);
                            updateNotificationsCommand.ExecuteNonQuery();
                        }

                        // Возвращаем сообщение об успешном выполнении операции и новое значение поля NotificationsAdvices
                        return Ok(new { message = "NotificationsAdvices updated successfully", notificationsAdvices = newNotificationsAdvices });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error toggling notifications advices: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error: {ex.Message}" });
            }
        }
        [HttpPost("toggleNotificationsHelp")]
        public IActionResult ToggleNotificationsHelp([FromBody] ToggleNotificationsModel model)
        {
            var userId = ExtractUserIdFromToken(model.Token);
            try
            {
                

                using (MySqlConnection connection = new MySqlConnection(_connectionString))
                {
                    connection.Open();

                    // Получаем текущее значение поля NotificationsHelp для указанного пользователя
                    string getCurrentValueQuery = "SELECT NotificationsHelp FROM Users WHERE Id = @userId";
                    using (MySqlCommand getCurrentValueCommand = new MySqlCommand(getCurrentValueQuery, connection))
                    {
                        getCurrentValueCommand.Parameters.AddWithValue("@userId", userId);
                        bool currentNotificationsHelp = Convert.ToBoolean(getCurrentValueCommand.ExecuteScalar());

                        // Определяем новое значение для поля NotificationsHelp (инвертирование текущего значения)
                        bool newNotificationsHelp = !currentNotificationsHelp;

                        // Обновляем поле NotificationsHelp в базе данных
                        string updateNotificationsQuery = "UPDATE Users SET NotificationsHelp = @newNotificationsHelp WHERE Id = @userId";
                        using (MySqlCommand updateNotificationsCommand = new MySqlCommand(updateNotificationsQuery, connection))
                        {
                            updateNotificationsCommand.Parameters.AddWithValue("@newNotificationsHelp", newNotificationsHelp);
                            updateNotificationsCommand.Parameters.AddWithValue("@userId", userId);
                            updateNotificationsCommand.ExecuteNonQuery();
                        }

                        // Возвращаем сообщение об успешном выполнении операции и новое значение поля NotificationsHelp
                        return Ok(new { message = "NotificationsHelp updated successfully", notificationsHelp = newNotificationsHelp });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error toggling notifications help: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error: {ex.Message}" });
            }
        }

        [HttpPost("toggleNotificationsRemind")]
        public IActionResult ToggleNotificationsRemind([FromBody] ToggleNotificationsModel model)
        {
            var userId = ExtractUserIdFromToken(model.Token);
            try
            {
               

                using (MySqlConnection connection = new MySqlConnection(_connectionString))
                {
                    connection.Open();

                    // Получаем текущее значение поля NotificationsRemind для указанного пользователя
                    string getCurrentValueQuery = "SELECT NotificationsRemind FROM Users WHERE Id = @userId";
                    using (MySqlCommand getCurrentValueCommand = new MySqlCommand(getCurrentValueQuery, connection))
                    {
                        getCurrentValueCommand.Parameters.AddWithValue("@userId", userId);
                        bool currentNotificationsRemind = Convert.ToBoolean(getCurrentValueCommand.ExecuteScalar());

                        // Определяем новое значение для поля NotificationsRemind (инвертирование текущего значения)
                        bool newNotificationsRemind = !currentNotificationsRemind;

                        // Обновляем поле NotificationsRemind в базе данных
                        string updateNotificationsQuery = "UPDATE Users SET NotificationsRemind = @newNotificationsRemind WHERE Id = @userId";
                        using (MySqlCommand updateNotificationsCommand = new MySqlCommand(updateNotificationsQuery, connection))
                        {
                            updateNotificationsCommand.Parameters.AddWithValue("@newNotificationsRemind", newNotificationsRemind);
                            updateNotificationsCommand.Parameters.AddWithValue("@userId", userId);
                            updateNotificationsCommand.ExecuteNonQuery();
                        }

                        // Возвращаем сообщение об успешном выполнении операции и новое значение поля NotificationsRemind
                        return Ok(new { message = "NotificationsRemind updated successfully", notificationsRemind = newNotificationsRemind });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error toggling notifications remind: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error: {ex.Message}" });
            }
        }


        [HttpPost("update-password-with-token")]
        public IActionResult UpdatePasswordWithToken([FromBody] UpdatePassWithTokenModel model)
        {
            try
            {
                // Получаем идентификатор пользователя из токена
                var userId = ExtractUserIdFromToken(model.Token);

                using (MySqlConnection connection = new MySqlConnection(_connectionString))
                {
                    connection.Open();

                    // Проверка наличия пользователя по идентификатору
                    string query = "SELECT * FROM Users WHERE Id = @UserId";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);

                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                // Получаем хэш пароля из базы данных
                                string storedPasswordHash = reader.GetString("Password");

                                // Проверяем, совпадает ли старый пароль с хэшем пароля в базе данных
                                if (BCrypt.Net.BCrypt.Verify(model.OldPassword, storedPasswordHash))
                                {
                                    // Обновляем пароль в базе данных
                                    string newPasswordHash = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);
                                    UpdateUserPassword(reader.GetString("Email"), newPasswordHash);

                                    return Ok(new { message = "Password updated successfully" });
                                }
                                else
                                {
                                    // Старый пароль не совпадает с хэшем пароля в базе данных
                                    return BadRequest(new { message = "Old password does not match" });
                                }
                            }
                            else
                            {
                                // Пользователь с указанным идентификатором не найден
                                return NotFound(new { message = "User not found" });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка в методе UpdatePasswordWithToken: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }

        [HttpPost("update-password-by-email")]
        public IActionResult UpdatePasswordByEmail([FromBody] UpdatePassByEmailModel model)
        {
            try
            {
                // Обновляем пароль в базе данных
                string newPasswordHash = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);
                UpdateUserPassword(model.Email, newPasswordHash);

                return Ok(new { message = "Password updated successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка в методе UpdatePasswordByEmail: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }



        private void UpdateUserPassword(string email, string newPasswordHash)
        {
            using (MySqlConnection connection = new MySqlConnection(_connectionString))
            {
                connection.Open();

                string query = "UPDATE Users SET Password = @NewPasswordHash WHERE Email = @Email";
                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@NewPasswordHash", newPasswordHash);
                    command.Parameters.AddWithValue("@Email", email);

                    command.ExecuteNonQuery();
                }
            }
        }
        [HttpPost("update-user")]
        public IActionResult UpdateUser([FromBody] UpdateUserRequest request)
        {
            var UserId = ExtractUserIdFromToken(request.Token);
            try
            {
                // Открываем соединение с базой данных
                using (MySqlConnection connection = new MySqlConnection(_connectionString))
                {
                    connection.Open();

                    // Строим запрос на обновление данных пользователя
                    string query = "UPDATE Users SET ";

                    // Проверяем наличие идентификатора пользователя в запросе
                    if (string.IsNullOrEmpty(UserId))
                    {
                        return BadRequest(new { message = "User Id is required" });
                    }

                    // Проверяем наличие полей для обновления
                    if (request.FieldsToUpdate == null || request.FieldsToUpdate.Count == 0)
                    {
                        return BadRequest(new { message = "Fields to update are required" });
                    }

                    // Добавляем каждое поле из запроса к запросу на обновление
                    foreach (var field in request.FieldsToUpdate)
                    {
                        query += $"{field.Key} = '{field.Value}', ";
                    }

                    // Удаляем последнюю запятую и пробел из запроса
                    query = query.TrimEnd(',', ' ');

                    // Добавляем условие WHERE для выбора пользователя по идентификатору
                    query += $" WHERE Id = '{UserId}'";

                    // Выполняем запрос на обновление
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.ExecuteNonQuery();
                    }

                    // Возвращаем успешный результат
                    return Ok(new { message = "User updated successfully" });
                }
            }
            catch (Exception ex)
            {
                // В случае ошибки возвращаем статус 500 и сообщение об ошибке
                Console.WriteLine($"Error updating user: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error: {ex.Message}" });
            }
        }
        [HttpPost("delete-user")]
        public IActionResult DeleteUser([FromBody] DeleteUserRequest request)
        {
            var userId = ExtractUserIdFromToken(request.Token);
            try
            {
                // Проверяем наличие идентификатора пользователя в запросе
                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(new { message = "User Id is required" });
                }

                // Открываем соединение с базой данных
                using (MySqlConnection connection = new MySqlConnection(_connectionString))
                {
                    connection.Open();

                    // Строим запрос на удаление пользователя
                    string query = $"DELETE FROM Users WHERE Id = '{userId}'";

                    // Выполняем запрос на удаление
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.ExecuteNonQuery();
                    }

                    // Возвращаем успешный результат
                    return Ok(new { message = "User deleted successfully" });
                }
            }
            catch (Exception ex)
            {
                // В случае ошибки возвращаем статус 500 и сообщение об ошибке
                Console.WriteLine($"Error deleting user: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error: {ex.Message}" });
            }
        }
        [HttpPost("update-email")]
        public IActionResult UpdateEmail([FromBody] UpdateEmailModel model)
        {
            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connectionString))
                {
                    connection.Open();

                    // Проверка наличия пользователя по email
                    string query = "SELECT * FROM Users WHERE LOWER(Email) = LOWER(@Email)";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@Email", model.CurrentEmail);

                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                // Получаем хэш пароля из базы данных
                                string storedPasswordHash = reader.GetString("Password");

                                // Проверяем, совпадает ли пароль с хэшем пароля в базе данных
                                if (BCrypt.Net.BCrypt.Verify(model.Password, storedPasswordHash))
                                {
                                    // Обновляем email пользователя в базе данных
                                    UpdateUserEmail(model.Token, model.CurrentEmail, model.NewEmail);

                                    return Ok(new { message = "Email updated successfully" });
                                }
                                else
                                {
                                    // Пароль не совпадает с хэшем пароля в базе данных
                                    return BadRequest(new { message = "Invalid password" });
                                }
                            }
                            else
                            {
                                // Пользователь с указанным email не найден
                                return NotFound(new { message = "User not found" });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка в методе UpdateEmail: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }

        private void UpdateUserEmail(string Token, string currentEmail, string newEmail)
        {
            var userId = ExtractUserIdFromToken(Token);
            using (MySqlConnection connection = new MySqlConnection(_connectionString))
            {
                connection.Open();

                string query = "UPDATE Users SET Email = @NewEmail WHERE Id = @UserId";
                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@UserId", userId);
                    command.Parameters.AddWithValue("@NewEmail", newEmail);
                    command.Parameters.AddWithValue("@CurrentEmail", currentEmail);

                    command.ExecuteNonQuery();
                }
            }
        }
        [HttpPost("toggleSubscription")]
        public IActionResult ToggleSubscription([FromBody] SubscriptionRequest subscriptionRequest)
        {
            var subscriberId = ExtractUserIdFromToken(subscriptionRequest.Token);

            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connectionString))
                {
                    connection.Open();

                    // Проверяем, существует ли запись о подписке для данного подписчика и пользователя
                    string checkQuery = "SELECT COUNT(*) FROM UsersSubscribe WHERE SubscriberId = @subscriberId AND SubscribedToId = @subscribedToId";
                    using (MySqlCommand checkCommand = new MySqlCommand(checkQuery, connection))
                    {
                        checkCommand.Parameters.AddWithValue("@subscriberId", subscriberId);
                        checkCommand.Parameters.AddWithValue("@subscribedToId", subscriptionRequest.SubscribedToId);
                        int count = Convert.ToInt32(checkCommand.ExecuteScalar());

                        // Переключаем подписку
                        if (count > 0)
                        {
                            // Если запись о подписке уже существует, удаляем ее
                            string deleteQuery = "DELETE FROM UsersSubscribe WHERE SubscriberId = @subscriberId AND SubscribedToId = @subscribedToId";
                            using (MySqlCommand deleteCommand = new MySqlCommand(deleteQuery, connection))
                            {
                                deleteCommand.Parameters.AddWithValue("@subscriberId", subscriberId);
                                deleteCommand.Parameters.AddWithValue("@subscribedToId", subscriptionRequest.SubscribedToId);
                                deleteCommand.ExecuteNonQuery();
                            }

                            return Ok(new { message = "Subscription removed successfully" });
                        }
                        else
                        {
                            // Если запись о подписке не существует, добавляем ее
                            string insertQuery = "INSERT INTO UsersSubscribe (SubscriberId, SubscribedToId) VALUES (@subscriberId, @subscribedToId)";
                            using (MySqlCommand insertCommand = new MySqlCommand(insertQuery, connection))
                            {
                                insertCommand.Parameters.AddWithValue("@subscriberId", subscriberId);
                                insertCommand.Parameters.AddWithValue("@subscribedToId", subscriptionRequest.SubscribedToId);
                                insertCommand.ExecuteNonQuery();
                            }

                            return Ok(new { message = "Subscription added successfully" });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ToggleSubscription method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }
        [HttpGet("likedUsers")]
        public IActionResult GetSubscriptions( string token)
        {
            try
            {
                // Extract user ID from the token
                string userId = ExtractUserIdFromToken(token);
                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(new { message = "Invalid token" });
                }

                using (MySqlConnection connection = new MySqlConnection(_connectionString))
                {
                    connection.Open();

                    // Query to get subscribed user IDs
                    string query = @"
                SELECT SubscribedToId
                FROM UsersSubscribe
                WHERE SubscriberId = @userId";

                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@userId", userId);

                        List<UserProfile> subscribedUserProfiles = new List<UserProfile>();

                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                int subscribedUserId = reader.GetInt32("SubscribedToId");
                                // Get user profile by ID
                                UserProfile userProfile = GetUserProfileById(subscribedUserId);
                                if (userProfile != null)
                                {
                                    subscribedUserProfiles.Add(userProfile);
                                }
                            }
                        }

                        return Ok(subscribedUserProfiles);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting subscriptions: {ex}");
                return StatusCode(500, new { message = "Internal Server Error" });
            }
        }

        private UserProfile GetUserProfileById(int userId)
        {
            using (MySqlConnection connection = new MySqlConnection(_connectionString))
            {
                connection.Open();
                string query = @"
            SELECT *
            FROM Users
            WHERE Id = @userId";

                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@userId", userId);

                    using (MySqlDataReader reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            return new UserProfile(reader);
                        }
                    }
                }
            }

            return null;
        }


        [HttpGet("getUserProfile")]
        public IActionResult GetUserProfile(int userId)
        {
            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connectionString))
                {
                    connection.Open();

                    // Запрос для получения профиля пользователя по его идентификатору
                    string query = @"
                SELECT *
                FROM Users
                WHERE Id = @userId";

                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@userId", userId);

                        // Профиль пользователя
                        UserProfile userProfile = null;

                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                userProfile = new UserProfile(reader);
                            }
                        }

                        if (userProfile != null)
                        {
                            return Ok(userProfile);
                        }
                        else
                        {
                            return NotFound(new { message = "User profile not found" });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting user profile: {ex}");
                return StatusCode(500, new { message = "Internal Server Error" });
            }
        }

    }
    public class TokenRequest
    {
        public string Token { get; set; }
    }

    public class SubscriptionRequest
    {
        public string Token { get; set; }  // Токен пользователя
        public int SubscribedToId { get; set; }  // Идентификатор пользователя, на которого подписываемся или отписываемся
    }
    public class ToggleNotificationsModel
    {
        public string Token { get; set; }
    }
    public class UpdateUserRequest
    {
        public string Token { get; set; }
        public Dictionary<string, string> FieldsToUpdate { get; set; }

    }
    public class DeleteUserRequest { 
        public string Token { get; set; }
    }
    public class UpdateEmailModel
    {
        public string Token { get; set; }
        public string CurrentEmail { get; set; }
        public string NewEmail { get; set; }
        public string Password { get; set; }
    }
    public class UpdatePassByEmailModel
    {
        public string Email { get; set; }
        public string NewPassword { get; set; }
    }
    public class UpdatePassWithTokenModel
    {
       
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
        public string Token { get; set; }
    }

}
