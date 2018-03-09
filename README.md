# Gawati Workflow

Workflow configurations are created in XML, and converted into XML for application consumption. 
You can generated directed graphs of the Worfklow based on the instructions below.

## Generating Documentation

 * `npm install` in the package folder
 * Download [Saxon](https://sourceforge.net/projects/saxon/files/Saxon-HE/9.8/saxonHE9-8-0-1J.zip/download)
 * Install [Graphviz](https://graphviz.gitlab.io/download/)


### Convert the Workflow XML to graphviz dot format

``` bash
java -jar <path to saxon9 he>/saxon9he.jar wf/act-legislation.xml xslt/wf2dotML.xsl  > act-legislation.dotML
java -jar ./act-legislation.dotML xslt/dotml2dot.xsl > act-legislation.dot

```

## Convert the dot file to an image

``` bash
dot ./act-legislation.dot -Tsvg -o ./act-legislation.svg
```


## Converting the Workflow XML to JSON

Run: 

``` bash
node xml2json.js --name=wf/act-legislation.xml 
{"workflow":{"doctype":"act", .... "from":"publish","to":"review"}]}}}
```
