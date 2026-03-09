import { extractCarData, extractCarDataFromHtml, extractCarDataFromUrl, type CarData } from "../src/extractCarData";

describe("extractCarData (DOM-based)", () => {
  const createDocument = (html: string): Document => {
    const parser = new DOMParser();
    return parser.parseFromString(html, "text/html");
  };

  it("extracts all fields from a standard listing", () => {
    const html = `
      <html>
        <body>
          <h1>2021 Toyota Corolla • Hybrid • Blue</h1>
          <span class="price-value">$25,000</span>
          <img src="https://example.com/car.jpg" />
        </body>
      </html>
    `;
    const document = createDocument(html);

    const result = extractCarData(document);

    const expected: CarData = {
      name: "2021 Toyota Corolla",
      year: "2021",
      mileage: null,
      price: "$25,000",
      image: "https://example.com/car.jpg"
    };

    expect({
      ...result,
      name: result.name?.trim() ?? null
    }).toEqual(expected);
  });

  it("returns nulls when elements are missing", () => {
    const html = `
      <html>
        <body>
          <!-- No h1, no price, no img -->
        </body>
      </html>
    `;
    const document = createDocument(html);

    const result = extractCarData(document);

    expect(result).toEqual({
      name: null,
      year: null,
      mileage: null,
      price: null,
      image: null
    });
  });

  it("handles h1 without year or mileage", () => {
    const html = `
      <html>
        <body>
          <h1>Toyota Corolla • Hybrid • Blue</h1>
          <span class="price-value">$25,000</span>
        </body>
      </html>
    `;
    const document = createDocument(html);

    const result = extractCarData(document);

    expect(result.name).toBe("Toyota Corolla ");
    expect(result.year).toBeNull();
    expect(result.mileage).toBeNull();
    expect(result.price).toBe("$25,000");
  });

  it("handles multiple matching elements by taking the first", () => {
    const html = `
      <html>
        <body>
          <h1>2019 Honda Civic • Sedan</h1>
          <h1>2020 Honda Civic • Sedan</h1>
          <span class="price-value">$20,000</span>
          <span class="price-value">$21,000</span>
          <img src="https://example.com/primary.jpg" />
          <img src="https://example.com/secondary.jpg" />
        </body>
      </html>
    `;
    const document = createDocument(html);

    const result = extractCarData(document);

    expect(result.name).toBe("2019 Honda Civic ");
    expect(result.year).toBe("2019");
    expect(result.price).toBe("$20,000");
    expect(result.image).toBe("https://example.com/primary.jpg");
  });

  it("extracts mileage when present in h1", () => {
    const html = `
      <html>
        <body>
          <h1>2018 Mazda 3 • 45,123 km • Automatic</h1>
        </body>
      </html>
    `;
    const document = createDocument(html);

    const result = extractCarData(document);

    expect(result.year).toBe("2018");
    expect(result.mileage).toBe("45,123 km");
  });

  it("sets image to null when src is missing", () => {
    const html = `
      <html>
        <body>
          <img alt="car without src" />
        </body>
      </html>
    `;
    const document = createDocument(html);

    const result = extractCarData(document);

    expect(result.image).toBeNull();
  });
});

describe("extractCarDataFromHtml", () => {
  it("parses HTML string and delegates to extractCarData", () => {
    const html = `
      <html>
        <body>
          <h1>2022 Subaru Outback • 10,000 km</h1>
          <span class="price-value">$35,000</span>
          <img src="https://example.com/outback.jpg" />
        </body>
      </html>
    `;

    const result = extractCarDataFromHtml(html);

    expect(result.name).toBe("2022 Subaru Outback ");
    expect(result.year).toBe("2022");
    expect(result.mileage).toBe("10,000 km");
    expect(result.price).toBe("$35,000");
    expect(result.image).toBe("https://example.com/outback.jpg");
  });
});

describe("extractCarDataFromUrl", () => {
  it("fetches HTML from URL and returns parsed data", async () => {
    const html = `
      <html>
        <body>
          <h1>2020 Ford Focus • 30,000 km</h1>
          <span class="price-value">$18,000</span>
          <img src="https://example.com/focus.jpg" />
        </body>
      </html>
    `;

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => html
    } as Response);

    global.fetch = mockFetch;

    const result = await extractCarDataFromUrl("https://example.com/listing");

    expect(mockFetch).toHaveBeenCalledWith("https://example.com/listing");
    expect(result.year).toBe("2020");
    expect(result.mileage).toBe("30,000 km");
    expect(result.price).toBe("$18,000");
    expect(result.image).toBe("https://example.com/focus.jpg");
  });

  it("throws when the response is not ok", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      text: async () => ""
    } as Response);

    global.fetch = mockFetch;

    await expect(extractCarDataFromUrl("https://example.com/missing")).rejects.toThrow(
      "Failed to fetch URL https://example.com/missing: 404 Not Found"
    );
  });
}
);

