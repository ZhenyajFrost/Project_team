using Microsoft.AspNetCore.Mvc;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Project2.Controllers
{
    [Route("api/paypal")]
    [ApiController]
    public class PayPalController : ControllerBase
    {
        private const string CLIENT_ID = "ARikEKHjq_emq0dWCRZEpEYbG4spMfmHPurLvUhLhPF4whJCl6xrZAPmVoPMp4WAmHRoMsUu_7Vog4WS";
        private const string CLIENT_SECRET = "EEL6Y9_fXL0Dzqrcd1e1OmBGAOvOuYIWpvGRkLXX91dGt3wQqMYMRTyFUm_Ulo6nCqRlW1kjuUfiMDtu";
        private const string MODE = "Mode";

        private const string LIVE_MODE = "Live";
        private const string LIVE_URL = "https://api-m.paypal.com";
        private const string SANDBOX_URL = "https://api-m.sandbox.paypal.com";

        private readonly HttpClient _httpClient;

        public PayPalController()
        {
            _httpClient = new HttpClient();
        }

        private async Task<AuthResponse> AuthenticateAsync()
        {
            var auth = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{CLIENT_ID}:{CLIENT_SECRET}"));

            var content = new StringContent("grant_type=client_credentials", Encoding.UTF8, "application/x-www-form-urlencoded");

            var request = new HttpRequestMessage
            {
                RequestUri = new Uri($"{GetBaseUrl()}/v1/oauth2/token"),
                Method = HttpMethod.Post,
                Headers = { { "Authorization", $"Basic {auth}" } },
                Content = content
            };

            var response = await _httpClient.SendAsync(request);
            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<AuthResponse>(json);

            return result!;
        }

        private string GetBaseUrl()
        {
            return MODE.Equals(LIVE_MODE) ? LIVE_URL : SANDBOX_URL;
        }

        [HttpPost("createOrder")]
        public async Task<IActionResult> CreateOrderAsync([FromBody] CreateOrderRequest request)
        {
            var auth = await AuthenticateAsync();

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.AccessToken);

            var response = await _httpClient.PostAsJsonAsync($"{GetBaseUrl()}/v2/checkout/orders", request);

            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<CreateOrderResponse>(json);

            return Ok(result);
        }

        [HttpPost("captureOrder/{orderId}")]
        public async Task<IActionResult> CaptureOrderAsync(string orderId)
        {
            var auth = await AuthenticateAsync();

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.AccessToken);

            var content = new StringContent(string.Empty, Encoding.Default, "application/json");

            var response = await _httpClient.PostAsync($"{GetBaseUrl()}/v2/checkout/orders/{orderId}/capture", content);

            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<CaptureOrderResponse>(json);

            return Ok(result);
        }
    }

    public class AuthResponse 
    {
        public string AccessToken { get; set; }
    }

    public class CreateOrderRequest
    {
        public string Intent { get; set; }
        public PaymentSource PaymentSource { get; set; }
        public List<PurchaseUnit> PurchaseUnits { get; set; }
    }

    public class PaymentSource
    {
        public Paypal Paypal { get; set; }
    }

    public class PurchaseUnit
    {
        public object Shipping { get; set; }
        public object Payments { get; set; }
        public string ReferenceId { get; set; }
        public Amount Amount { get; set; }
    }

    public class Amount
    {
        public string CurrencyCode { get; set; }
        public string Value { get; set; }
    }

    public class Paypal
    {
        public string Name { get; set; }
        public string EmailAddress { get; set; }
        public string AccountId { get; set; }
        public ExperienceContext ExperienceContext { get; set; }
    }

    public class ExperienceContext
    {
        public string ShippingPreference { get; set; }
    }

    public class CreateOrderResponse
    {
        public string Id { get; set; }
        public string Status { get; set; }
        // TO DOO Add other properties as per PayPal documentation
    }

    public class CaptureOrderResponse
    {
        public string Id { get; set; }
        public string Status { get; set; }
        // TO DOO Add other properties as per PayPal documentation
    }



}
