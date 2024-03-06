using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Project_team2;
using System;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);

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
