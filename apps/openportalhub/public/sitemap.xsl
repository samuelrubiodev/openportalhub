<?xml version="1.0" encoding="UTF-8"?>
<!-- Human-readable view of sitemap.xml. Crawlers ignore this stylesheet and read the
     XML, so nothing here affects indexing. Browsers fetch it because of the
     xml-stylesheet processing instruction the generator writes into sitemap.xml. -->
<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  exclude-result-prefixes="s xhtml">

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>openportalhub.org — sitemap</title>
        <style>
          :root {
            --ground: #131313;
            --raised: #1a1a1a;
            --hairline: #2c2c2c;
            --ink: #f5f5f3;
            --grey: #8a8a8a;
            --dim: #6f6f6f;
            --red: #d23b2e;
            --mono: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 48px 40px 72px;
            background: var(--ground);
            color: var(--ink);
            font-family: var(--mono);
            font-size: 13px;
            line-height: 1.6;
          }
          h1 {
            margin: 0 0 6px;
            font-size: 22px;
            letter-spacing: 0.06em;
            text-transform: uppercase;
          }
          .lead { margin: 0 0 32px; color: var(--grey); max-width: 70ch; }
          .lead b { color: var(--ink); font-weight: 400; }
          table { border-collapse: collapse; width: 100%; }
          th {
            text-align: left;
            font-weight: 400;
            font-size: 11px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--dim);
            padding: 0 16px 10px 0;
            border-bottom: 1px solid var(--hairline);
          }
          td {
            padding: 14px 16px 14px 0;
            border-bottom: 1px solid var(--hairline);
            vertical-align: top;
          }
          td.page { color: var(--ink); }
          a { color: var(--ink); text-decoration: none; border-bottom: 1px solid var(--red); }
          a:hover, a:focus-visible { color: var(--red); }
          .lang { color: var(--red); }
          .alt { color: var(--grey); }
          .alt a { border-bottom-color: var(--hairline); }
          .note { margin: 28px 0 0; color: var(--dim); font-size: 11px; }
          @media (max-width: 720px) {
            body { padding: 32px 20px 48px; }
            .alternates, .lastmod { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Sitemap</h1>
        <p class="lead">
          Every page of this site in both languages. Each URL points at its own
          static file, and the <b>alternates</b> column is the hreflang set the
          crawler reads from inside the page.
        </p>
        <table>
          <thead>
            <tr>
              <th>Page</th>
              <th>Language</th>
              <th class="alternates">Alternates</th>
              <th class="lastmod">Last modified</th>
            </tr>
          </thead>
          <tbody>
            <xsl:apply-templates select="s:urlset/s:url" />
          </tbody>
        </table>
        <p class="note">
          This is sitemap.xml with a stylesheet applied. Crawlers read the XML and
          ignore the stylesheet.
        </p>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="s:url">
    <tr>
      <td class="page">
        <a href="{s:loc}"><xsl:value-of select="s:loc" /></a>
      </td>
      <td class="lang">
        <xsl:choose>
          <xsl:when test="starts-with(s:loc, 'https://openportalhub.org/es')">Spanish</xsl:when>
          <xsl:otherwise>English</xsl:otherwise>
        </xsl:choose>
      </td>
      <td class="alt alternates">
        <xsl:for-each select="xhtml:link">
          <a href="{@href}"><xsl:value-of select="@hreflang" /></a>
          <xsl:if test="position() != last()"><xsl:text> · </xsl:text></xsl:if>
        </xsl:for-each>
      </td>
      <td class="lastmod"><xsl:value-of select="s:lastmod" /></td>
    </tr>
  </xsl:template>

</xsl:stylesheet>
