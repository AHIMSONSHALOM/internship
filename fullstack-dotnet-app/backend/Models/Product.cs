using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("T_PRODUCTS")]
    public class Product
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int F_PRODUCT_ID { get; set; } // Matches Int in SQL 

        public string F_PROD_NAME { get; set; } = string.Empty; // Matches VARCHAR 
        public string F_BRAND { get; set; } = string.Empty;     // Matches VARCHAR 
        
        // FIX IS HERE: Changed from string to int to match the SQL database column
        public int F_QTY { get; set; } 
        
        public double F_PRICE { get; set; }       // Matches FLOAT 
        public string? F_PROD_DESC { get; set; }  // Matches VARCHAR(MAX) 
        public double? F_PROD_RATING { get; set; } // Matches FLOAT 
    }
}