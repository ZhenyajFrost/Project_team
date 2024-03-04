using MySqlConnector;
using System;

public class Lot
{
    public int Id { get; set; }
    public string Title { get; set; }
    public decimal Price { get; set; }
    public string ShortDescription { get; set; }
    public string Category { get; set; }
    public DateTime TimeTillEnd { get; set; }
    public bool Approved { get; set; }
    public string[] ImageURLs { get; set; }
    public string UserId { get; set; }
    public decimal CurrentBid { get; set; } // Новое свойство для текущей ставки
    public string Region { get; set; } // Новое свойство для региона
    public string City { get; set; }   // Новое свойство для города

    public Lot(MySqlDataReader reader)
    {
        Id = Convert.ToInt32(reader["Id"]);
        Title = reader["Title"].ToString();
        Price = Convert.ToDecimal(reader["Price"]);
        ShortDescription = reader["ShortDescription"].ToString();
        Category = reader["Category"].ToString();
        TimeTillEnd = Convert.ToDateTime(reader["TimeTillEnd"]);
        Approved = Convert.ToBoolean(reader["Approved"]);

        string imageURLsString = reader["ImageURLs"].ToString();
        ImageURLs = imageURLsString.Split(',');
        UserId = reader["UserId"].ToString();
        CurrentBid = Convert.ToDecimal(reader["CurrentBid"]); // Извлекаем текущую ставку из результата запроса

        // Добавление извлечения региона и города из результата запроса
        Region = reader["Region"].ToString();
        City = reader["City"].ToString();
    }
}
