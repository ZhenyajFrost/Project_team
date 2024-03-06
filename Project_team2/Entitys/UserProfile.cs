using MySqlConnector;

public class UserProfile
{
    public string Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Login { get; set; }
    public string Email { get; set; }
    public string City { get; set; }
    public string Country { get; set; }
    public string Phone { get; set; }
    public string Postcode { get; set; }
    public string Region { get; set; }
    public string Avatar { get; set; }
    public string LastLogin { get; set; }
    public string RegistrationTime { get; set; }
    public bool IsAdmin { get; set; }


    public UserProfile(MySqlDataReader reader)
    {
        Id = reader["Id"].ToString();
        FirstName = reader["FirstName"].ToString();
        LastName = reader["LastName"].ToString();
        Login = reader["Login"].ToString();
        Email = reader["Email"].ToString();
        City = reader["City"].ToString();
        Country = reader["Country"].ToString();
        Phone = reader["Phone"].ToString();
        Postcode = reader["Postcode"].ToString();
        Region = reader["Region"].ToString();
        LastLogin = reader["LastLogin"].ToString();
        RegistrationTime = reader["RegistrationTime"].ToString();
        IsAdmin = Convert.ToBoolean(reader["IsAdmin"]);
        Avatar = reader["Avatar"].ToString();
    }
}