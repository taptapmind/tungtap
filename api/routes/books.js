import { Hono } from "hono";
import { selectDataSource, booksMockUtils } from "../lib/utils.js";

// Create books router
const booksRouter = new Hono();

// Books list endpoint with filtering and sorting
booksRouter.get("/", async (c) => {
  const { genre, sort } = c.req.query();

  // Use imported mock logic
  const mockLogic = async (c) => {
    return booksMockUtils.getBooksList(c, genre, sort);
  };

  // Database logic
  const dbLogic = async (c) => {
    const sql = c.env.DB;
       // const stmt = env.DB.prepare("SELECT * FROM comments LIMIT 30");
    //const { results } = await stmt.all();
    let query =  await sql.prepare`SELECT * FROM books`.all()

    // Apply genre filter if provided
    if (genre) {
      query =  await sql.prepare`SELECT * FROM books WHERE genre = ${genre}`.all()
    }

    // Apply sorting if provided
    if (sort) {
      switch (sort) {
        case "title_asc":
          query = genre
            ?  await sql.prepare`SELECT * FROM books WHERE genre = ${genre} ORDER BY title ASC`.all()
            :  await sql.prepare`SELECT * FROM books ORDER BY title ASC`.all()
          break;
        case "title_desc":
          query = genre
            ?  await sql.prepare`SELECT * FROM books WHERE genre = ${genre} ORDER BY title DESC`.all()
            :  await sql.prepare`SELECT * FROM books ORDER BY title DESC`.all()
          break;
        case "author_asc":
          query = genre
            ?  await sql.prepare`SELECT * FROM books WHERE genre = ${genre} ORDER BY author ASC`.all()
            :  await sql.prepare`SELECT * FROM books ORDER BY author ASC`.all()
          break;
        case "author_desc":
          query = genre
            ?  await sql.prepare`SELECT * FROM books WHERE genre = ${genre} ORDER BY author DESC`.all()
            :  await sql.prepare`SELECT * FROM books ORDER BY author DESC`.all()
          break;
        default:
          // Default sort, no change to query needed
          break;
      }
    }

    // Execute query
    const results = await query;

    // Return results
    return Response.json({
      books: results.results,
      source: "database",
    },  {
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // hoặc chỉ định domain cụ thể
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  }
});
  };

  return selectDataSource(c, dbLogic, mockLogic);
});

// Book details endpoint
booksRouter.get("/:id", async (c) => {
  const bookId = c.req.param("id");

  // Use imported mock logic
  const mockLogic = async (c) => {
    return booksMockUtils.getBookDetail(c, bookId);
  };

  // Database logic
  const dbLogic = async (c) => {
    const sql = c.env.DB;

    // Get the specific book by ID
    const book = await sql.prepare`SELECT * FROM books WHERE id = ${bookId}`.all()

    if (book.length === 0) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    return Response.json({
      book: book[0],
      source: "database",
    });
  };

  return selectDataSource(c, dbLogic, mockLogic);
});

export default booksRouter;
