using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Project_team2;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

var builder = WebApplication.CreateBuilder(args);

// ��������� �������������� � ������ ��������
builder.Services.AddControllersWithViews();
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
})
.AddCookie(options =>
{
    options.LoginPath = "/google/signin";
})
.AddGoogle(googleOptions =>
{
    googleOptions.ClientId = "6001760886-n0diorlhsrml5hlokovhhi18ulh6molj.apps.googleusercontent.com";
    googleOptions.ClientSecret = "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";
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader());
});

builder.Services.AddSingleton<ILoggerFactory, LoggerFactory>();

// ��������� Email � WebSocket ��������
builder.Services.AddHostedService<LotViewsEmailService>(sp =>
    new LotViewsEmailService(
        Config.MySqlConnection,
        Config.SmtpServer,
        Config.SmtpPort,
        Config.SmtpUsername,
        Config.SmtpPassword

    )
);
builder.Services.AddHostedService<LotExpirationReminderService>(sp =>
    new LotExpirationReminderService(
        Config.MySqlConnection,
        Config.SmtpServer,
        Config.SmtpPort,
        Config.SmtpUsername,
        Config.SmtpPassword
    )
);
builder.Services.AddHostedService<LotSchedulingService>(sp =>
    new LotSchedulingService(
        Config.MySqlConnection,
        sp.GetRequiredService<ILogger<LotSchedulingService>>(),
        Config.SmtpServer,
        Config.SmtpPort,
        Config.SmtpUsername,
        Config.SmtpPassword
    )
);


// ����������� WebSocketServer ��� Singleton, ����� ��� ����� ���� ��������
builder.Services.AddSingleton<WebSocketServer>();
builder.Services.AddHttpClient();

var app = builder.Build();


// ��������� WebSocket �����������
app.UseWebSockets();

// ��������� HTTP ��������
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// �����! �������� ��� ��� ������������� � ������������
app.MapControllers();



app.MapFallbackToFile("index.html");

app.Run();
