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
    public bool IsNotif { get; set; }
    public bool Active { get; set; }
    public bool Unactive { get; set; }
    public bool Archive { get; set; }
    public bool IsWaitingPayment { get; set; }
    public bool IsNew { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MinStepPrice { get; set; }
    public int Views { get; set; }
    public bool IsWaitingDelivery { get; set; }
    public bool AllowBids { get; set; }
    public string WinnerUserId { get; set; }

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

        IsNotif = Convert.ToBoolean(reader["isNotif"]);
        Active = Convert.ToBoolean(reader["Active"]);
        Unactive = Convert.ToBoolean(reader["Unactive"]);
        Archive = Convert.ToBoolean(reader["Archive"]);
        IsWaitingPayment = Convert.ToBoolean(reader["isWaitingPayment"]);
        IsNew = Convert.ToBoolean(reader["isNew"]);
        MinPrice = reader["minPrice"] == DBNull.Value ? (decimal?)null : Convert.ToDecimal(reader["minPrice"]);
        MinStepPrice = reader["minStepPrice"] == DBNull.Value ? (decimal?)null : Convert.ToDecimal(reader["minStepPrice"]);
        Views = Convert.ToInt32(reader["Views"]);
        IsWaitingDelivery = Convert.ToBoolean(reader["isWaitingDelivery"]);
        AllowBids = Convert.ToBoolean(reader["AllowBids"]);

        WinnerUserId = reader["WinnerUserId"].ToString();
    }
}