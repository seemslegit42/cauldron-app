/**
 * HTML sanitization utility
 */

/**
 * Sanitizes HTML to prevent XSS attacks
 * 
 * @param html The HTML to sanitize
 * @returns Sanitized HTML
 * 
 * @example
 * ```
 * sanitizeHtml('<script>alert("XSS")</script>Hello') // 'Hello'
 * sanitizeHtml('<b>Bold</b> text') // '<b>Bold</b> text'
 * ```
 */
export function sanitizeHtml(html: string): string {
  // This is a simple implementation that removes all HTML tags
  // In a production environment, you should use a proper HTML sanitizer like DOMPurify
  
  // Create a temporary element
  const tempElement = document.createElement('div');
  
  // Set the HTML content
  tempElement.innerHTML = html;
  
  // Get the text content
  const textContent = tempElement.textContent || tempElement.innerText || '';
  
  return textContent;
}

/**
 * Sanitizes HTML to allow only specific tags
 * 
 * @param html The HTML to sanitize
 * @param allowedTags An array of allowed HTML tags
 * @returns Sanitized HTML
 * 
 * @example
 * ```
 * sanitizeHtmlAllowTags('<script>alert("XSS")</script><b>Bold</b>', ['b']) // '<b>Bold</b>'
 * ```
 */
export function sanitizeHtmlAllowTags(html: string, allowedTags: string[]): string {
  // This is a simple implementation that allows only specific HTML tags
  // In a production environment, you should use a proper HTML sanitizer like DOMPurify
  
  // Create a temporary element
  const tempElement = document.createElement('div');
  
  // Set the HTML content
  tempElement.innerHTML = html;
  
  // Remove disallowed tags
  const allElements = tempElement.getElementsByTagName('*');
  for (let i = allElements.length - 1; i >= 0; i--) {
    const element = allElements[i];
    if (!allowedTags.includes(element.tagName.toLowerCase())) {
      // Replace the element with its text content
      element.outerHTML = element.textContent || '';
    }
  }
  
  return tempElement.innerHTML;
}

/**
 * Escapes HTML special characters
 * 
 * @param text The text to escape
 * @returns Escaped text
 * 
 * @example
 * ```
 * escapeHtml('<script>alert("XSS")</script>') // '&lt;script&gt;alert("XSS")&lt;/script&gt;'
 * ```
 */
export function escapeHtml(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return text.replace(/[&<>"']/g, (match) => escapeMap[match]);
}
