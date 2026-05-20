using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using System.Linq;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. GET METHOD (Reading Data)
        [HttpGet]
        public IActionResult Get()
        {
            var productList = _context.Products.OrderBy(p => p.F_PRODUCT_ID).ToList();
            return Ok(productList);
        }

        // 2. ADD THIS NEW POST METHOD (Saving Data)
        [HttpPost]
        public IActionResult Post([FromBody] Product newProduct)
        {
            if (newProduct == null)
            {
                return BadRequest("Product data payload is empty.");
            }

            // Entity Framework will automatically generate the INSERT SQL statement
            _context.Products.Add(newProduct);
            _context.SaveChanges(); // This saves it to your T_PRODUCTS SQL table

            return Ok(newProduct);
        }
    }
}