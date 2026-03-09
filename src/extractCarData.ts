export interface CarData {
  name: string | null;
  year: string | null;
  mileage: string | null;
  price: string | null;
  image: string | null;
}

type SchemaKey = keyof CarData;

interface SchemaRuleObject {
  selector: string;
  regex?: RegExp;
  attr?: string;
}

type SchemaRule = string | SchemaRuleObject;

type ExtractionSchema = Record<SchemaKey, SchemaRule>;

const schema: ExtractionSchema = {
  name: {
    selector: "h1",
    regex: /^[^•]+/
  },
  year: {
    selector: "h1",
    regex: /\b\d{4}\b/
  },
  mileage: {
    selector: "h1",
    regex: /\d{1,3}(?:,\d{3})*\s?km/
  },
  price: ".price-value",
  image: {
    selector: "img",
    attr: "src"
  }
};

const getText = (el: Element | null): string | null => {
  if (!el) return null;
  const text = (el as HTMLElement).innerText ?? (el.textContent ?? "");
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export function extractCarData(document: Document): CarData {
  const result: CarData = {
    name: null,
    year: null,
    mileage: null,
    price: null,
    image: null
  };

  (Object.keys(schema) as SchemaKey[]).forEach((key) => {
    const rule = schema[key];

    if (typeof rule === "string") {
      const el = document.querySelector(rule);
      result[key] = getText(el);
      return;
    }

    const el = document.querySelector(rule.selector);

    if (!el) {
      result[key] = null;
      return;
    }

    let value: string | null;

    if (rule.attr) {
      const attrValue = el.getAttribute(rule.attr);
      value = attrValue !== null ? attrValue : null;
    } else {
      value = getText(el);
    }

    if (rule.regex && value) {
      const match = value.match(rule.regex);
      value = match && match[0] ? match[0] : null;
    }

    result[key] = value;
  });

  return result;
}

export function extractCarDataFromHtml(html: string): CarData {
  // Dynamic import to avoid hard dependency on jsdom types at call sites
  // (bundlers / environments can tree-shake or polyfill as needed).
  // In Node and tests, jsdom will be available via dependency.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { JSDOM } = require("jsdom") as typeof import("jsdom");
  const dom = new JSDOM(html);
  return extractCarData(dom.window.document);
}

export async function extractCarDataFromUrl(url: string): Promise<CarData> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch URL ${url}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  return extractCarDataFromHtml(html);
}

