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
    public decimal CurrentBid { get; set; }
    public string Region { get; set; }
    public string City { get; set; }
    public bool IsWaitingPayment { get; set; } // новое свойство
    public bool IsNew { get; set; } // новое свойство
    public decimal MinPrice { get; set; } // новое свойство
    public decimal MinStepPrice { get; set; } // новое свойство

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
        CurrentBid = Convert.ToDecimal(reader["CurrentBid"]);

        Region = reader["Region"].ToString();
        City = reader["City"].ToString();

        // Извлечение новых полей из результата запроса и установка соответствующих свойств
        IsWaitingPayment = Convert.ToBoolean(reader["isWaitingPayment"]);
        IsNew = Convert.ToBoolean(reader["isNew"]);
        MinPrice = Convert.ToDecimal(reader["minPrice"]);
        MinStepPrice = Convert.ToDecimal(reader["minStepPrice"]);
    }
}
