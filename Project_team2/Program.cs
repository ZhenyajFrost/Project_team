using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Project_team2;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;


var builder = WebApplication.CreateBuilder(args);


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
    googleOptions.ClientId = "6001760886-n0diorlhsrml5hlokovhhi18ulh6molj.apps.googleusercontent.com"; // Replace with your Google Client ID
    googleOptions.ClientSecret = "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"; // Replace with your Google Client Secret
});

// Add services to the container.
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader());
});

builder.Services.AddControllersWithViews();
builder.Services.AddSingleton<ILoggerFactory, LoggerFactory>();

// Используем Config для предоставления параметров конструктора LotViewsEmailService
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
var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

// Enable CORS
app.UseCors();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html");

app.Run();
