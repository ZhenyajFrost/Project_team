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
            try
            {
                string userId = model.UserId; // Получаем userId из модели

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
            try
            {
                string userId = model.UserId; // Получаем userId из модели

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
            try
            {
                string userId = model.UserId; // Получаем userId из модели

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


        [HttpPost("update-password")]
        public IActionResult UpdatePassword([FromBody] UpdatePassModel model)
        {
            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connectionString))
                {
                    connection.Open();

                    // Проверка наличия пользователя по электронной почте
                    string query = "SELECT * FROM Users WHERE Email = @Email";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@Email", model.Email);

                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                // Получаем идентификатор пользователя
                                int userId = reader.GetInt32("Id");

                                // Обновляем пароль в базе данных
                                string newPasswordHash = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);
                                UpdateUserPassword(model.Email, newPasswordHash);

                                return Ok(new { message = "Password updated successfully" });
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
                Console.WriteLine($"Ошибка в методе UpdatePassword: {ex.ToString()}");
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
                                // Обновляем email пользователя в базе данных
                                UpdateUserEmail(model.Token, model.CurrentEmail, model.NewEmail);

                                return Ok(new { message = "Email updated successfully" });
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
    }
    public class ToggleNotificationsModel
    {
        public string UserId { get; set; }
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
    }
    public class UpdatePassModel
    {
       
        public string Email { get; set; }
        public string NewPassword { get; set; }
    }
}
