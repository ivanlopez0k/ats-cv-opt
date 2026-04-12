import sanitizeHtmlLib from 'sanitize-html';

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Used to clean AI-generated HTML before rendering in PDFs and previews.
 */
export function sanitizeHtml(html: string): string {
  return sanitizeHtmlLib(html, {
    allowedTags: [
      // Structural
      'html', 'head', 'body', 'div', 'section', 'header', 'footer', 'main', 'article',
      // Typography
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      // Lists
      'ul', 'ol', 'li',
      // Inline formatting
      'strong', 'b', 'em', 'i', 'u', 'strike', 'del', 'ins', 'sub', 'sup',
      'span', 'small', 'mark',
      // Links and images
      'a', 'img',
      // Tables
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
      // Definition lists
      'dl', 'dt', 'dd',
      // Quotes
      'blockquote', 'q', 'cite',
      // Code
      'code', 'pre',
      // Forms (limited - no input)
      'label',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      '*': ['class', 'style', 'id'],
      table: ['border', 'cellpadding', 'cellspacing'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan', 'scope'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {},
    allowedSchemesAppliedToAttributes: ['href', 'src'],
    allowProtocolRelative: false,
    allowedClasses: {
      '*': ['*'], // Allow all classes
    },
    allowedStyles: {
      '*': {
        // Allow common CV styling properties
        'color': [/^[\#a-zA-Z0-9\s,().%]+$/],
        'background-color': [/^[\#a-zA-Z0-9\s,().%]+$/],
        'font-size': [/^[\d]+[a-z%]+$/],
        'font-weight': [/^(bold|normal|[1-9]00)$/],
        'font-style': [/^(italic|normal)$/],
        'text-align': [/^(left|center|right|justify)$/],
        'margin': [/^[\d\s]+[a-z%]+$/],
        'padding': [/^[\d\s]+[a-z%]+$/],
        'border': [/^[\w\s\d#(),.%-]+$/],
        'display': [/^(block|inline|inline-block|flex|none)$/],
        'width': [/^[\d]+[a-z%]+$/],
        'height': [/^[\d]+[a-z%]+$/],
        'text-decoration': [/^(none|underline|line-through)$/],
        'line-height': [/^[\d.]+[a-z%]?$/],
        'letter-spacing': [/^[\d.]+[a-z%]+$/],
        'text-transform': [/^(uppercase|lowercase|capitalize|none)$/],
        'font-family': [/^[\w\s,'"-]+$/],
      },
    },
    // Disallow all event handlers (onclick, onerror, etc.)
    disallowedTagsMode: 'discard',
    // Remove comments
    parser: {
      decodeEntities: true,
    },
  });
}
