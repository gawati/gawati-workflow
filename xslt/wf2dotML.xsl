<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
    xmlns="http://www.martin-loetzsch.de/DOTML" 
    xmlns:xs="http://www.w3.org/2001/XMLSchema" 
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" 
    exclude-result-prefixes="xs xd" version="2.0">
    
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p>
                <xd:b>Created on:</xd:b> Nov 23, 2016</xd:p>
            <xd:p>
                <xd:b>Author:</xd:b> ashok</xd:p>
            <xd:p/>
        </xd:desc>
    </xd:doc>
    
    <xsl:template match="/">
        
        <graph file-name="graphs/wf" rankdir="TB">
            <xsl:call-template name="states"/>
            <xsl:call-template name="transitions"/>

        </graph>
    </xsl:template>
    
    <xsl:template name="states">
        <xsl:for-each select="//states/state">
          <cluster id="c{@name}">
              <xsl:attribute name="label">
                  <xsl:for-each select="./permission">
                      <xsl:value-of select="concat(@name, '=', @roles)"/>
                      <xsl:if test="not(position() eq last())">
                          <xsl:value-of select="'\n'"/>
                      </xsl:if>
                  </xsl:for-each>
              </xsl:attribute>
            <node id="{@name}" label="{@level} {@title}" fontcolor="#0000FF" fontsize="9" fontname="Arial"/>
          </cluster>
        </xsl:for-each>
        
    </xsl:template>
    
    <xsl:template name="transitions">
        <xsl:for-each select="//transitions/transition">
          <xsl:if test="string-length(@from) gt 0">
            <edge fontcolor="#FF0000" from="{./@from}" to="{./@to}" label="{./@title}" fontsize="9" fontname="Arial"/>
          </xsl:if>
        </xsl:for-each>
        
    </xsl:template>
</xsl:stylesheet>