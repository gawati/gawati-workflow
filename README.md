# Gawati Workflow

Workflow configurations are created in XML, and converted into XML for application consumption. 
You can generated directed graphs of the Worfklow based on the instructions below.

Gawati Workflow is a stateful workflow, and is intended to support moving a document through different states via state transitions. 
The Workflow allows defining who can do what in each state, and also who is allowed to transit between states. 
Transitions connect states, and allow building complex workflows using just a few states. 

## Generating Documentation

 * `npm install` in the package folder
 * Download [Saxon](https://sourceforge.net/projects/saxon/files/Saxon-HE/9.8/saxonHE9-8-0-1J.zip/download)
 * Install [Graphviz](https://graphviz.gitlab.io/download/)


### Convert the Workflow XML to graphviz dot format

``` bash
java -jar <path to saxon9 he>/saxon9he.jar wf/act-legislation.xml xslt/wf2dotML.xsl  > act-legislation.dotML
java -jar ./act-legislation.dotML xslt/dotml2dot.xsl > act-legislation.dot

```

### Convert the dot file to an image

``` bash
dot ./act-legislation.dot -Tsvg -o ./act-legislation.svg
```


### Converting the Workflow XML to JSON

Run: 

``` bash
node xml2json.js --name=wf/act-legislation.xml 
{"workflow":{"doctype":"act", .... "from":"publish","to":"review"}]}}}
```

## Workflow structure

Each workflow is defined using a `<workflow>` tag, the attributes `doctype` and `subtype` correspond to Akoma Ntoso document type and sub types for the document.  A workflow definition

``` xml
<workflow doctype="act" subtype="legislation">
    ....
</workflow>
```

We describe available permissions in a `<permissions>` element. To the workflow package, the permissions are just labels and the application using the workflow needs to implement the corresponding functionality - except for the `transit` permission which is specific to the workflow, and states who is allowed to transit from one state of the workflow to another.

```
    <permissions>
        <permission name="view" title="View" icon="fa-eye"/>
        <permission name="edit" title="Edit" icon="fa-pencil"/>
        <permission name="delete" title="Delete" icon="fa-trash-o"/>
        <permission name="list" title="List" icon="fa-flag"/>
        <permission name="transit" title="Transit" icon="fa-flag"/>
    </permissions>
```

In the context of gawati the permissions are intended to have the following meaning: 
    * view - allows viewing a document
    * edit - allows editing a document
    * delete - allows deleting a document
    * list - allows seeing the document in a list (but not viewing it)
    * transit - allows transiting from the state to another.

States are defined in the `<states>` element and are uniquely identified via a `name` attribute. 
In a workflow a state is always unique. `level` and `color` attributes are there for purely documentation related purposes and are non mandatory.

A state defines permissions applicable in that state. Each `permission` has to correspond to a name of a permission defined in the `<permissions>` block. A permission in a state is always associated with one or more roles stated in the `roles` attribute.

``` xml
1    <state name="editable" title="Editable" level="2" color="initial">
2        <permission name="view" roles="admin editor"/>
3        <permission name="list" roles="admin editor submitter" />
4        <permission name="delete" roles="admin editor"/>
5        <permission name="edit" roles="admin editor"/>
6        <permission name="transit" roles="admin editor"/>
7    </state>
```

Permissions defined in a state have a particular meaning: 
    * line 2 : `<permission name="view" roles="admin editor"/>` - only users with an admin or editor role can view the document
    * line 3 : `<permission name="list" roles="admin editor submitter" />` - only users with an admin, editor or submitter role can see the document in a listing
    * line 4: `<permission name="delete" roles="admin editor"/>` - only admin, editor users can delete the document
    * line 6: `<permission name="transit" roles="admin editor"/>` - only admin, editor users can transit the document via a state transition

Transitions allow the document to be moved from one state to another: 

``` xml
    <transitions>

        <transition name="make_editable" icon="fa-thumbs-up" title="Send for Editing"
            from="draft" to="editable" />

        <transition name="make_drafting" icon="fa-thumbs-up" title="Back to Drafting"
            from="editable" to="draft" />

        ...

        <transition name="make_retract" icon="fa-building" title="Retract" 
            from="publish" to="review" />

    </transitions>
```

A transition has to have a unique `name`, the `icon` attribute is a font-awesome icon code which is used in the UI next to the transition title. The transition also has `from` and `to` attributes each of which points to a `<state>` name defined earlier. 
This transition moves the document from `editable`=>`available_for_review` states. 

``` xml
    <transition name="send_for_review" icon="fa-check" title="Send for Review" 
        from="editable" to="available_for_review" />
```

The `transit` permission on the `editable` state (which is the `from` state), permits `admin` and `editor` role users to move the document from `editable` to `available_for_review`. 

``` xml
    <state name="editable" title="Editable" level="2" color="initial">
        ...
        <permission name="transit" roles="admin editor"/>
    </state>
```

