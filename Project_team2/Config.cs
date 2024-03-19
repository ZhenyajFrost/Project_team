using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.Extensions.DependencyInjection;

namespace Project_team2
{
    public class Config
    {
        public static string MySqlConnection { get; } = "Server=46.175.150.80;User ID=danridep;Password=danridep;Database=ebayclone;";
        public static string SmtpServer { get; } = "smtp.gmail.com";
        public static int SmtpPort { get; } = 587;
        public static string SmtpUsername { get; } = "danridep.danri@gmail.com";
        public static string SmtpPassword { get; } = "khtojlbdaeadwmpn";
        public static string TelegramBotToken { get; } = "6693790489:AAHzRPq9DZzY_mfRoyqYZm6_Z0q9nkCHqIk";
        public static long ChatId { get; } = -1002051823222;

    }


}
