"use strict";


var data = (function() {

    var data = [
        {
            title: "National",
            parent: 'Top',
            hasChildren: true
        },
        {
            title: "Best Buy",
            parent: "National",
            hasChildren: true
        },
        {
            title: "Best Buy Mobile",
            parent: "National",
            hasChildren: false
        },
        {
            title: "Western",
            parent: "Best Buy",
            hasChildren: false
        },
        {
            title: "Central",
            parent: "Best Buy",
            hasChildren: false
        },
        {
            title: "Eastern",
            parent: "Best Buy",
            hasChildren: false
        }
    ];

    function getItems() {
        return data;
    }

    function BuildMap(data) {
        var map = {};

        data.forEach(function(item) {
            map[item.title] = { title: item.title, parent: item.parent };
        });

        return map;
    }

    function buildBreadCrumb(node, map) {
        var current = node;
        var breadcrumb = [];

        while (map.hasOwnProperty(current)) {
            breadcrumb.push(current);
            current = map[current].parent
        }

        breadcrumb.push('Top');

        return breadcrumb.reverse();
    }

    return {
        getItems: getItems,
        buildBreadcrumb: function(node) {
            return buildBreadCrumb(node, BuildMap(data));
        }
    }

})();

var HierarchyComponent = React.createClass({

    getInitialState: function() {
        return {
            collapsed: true,
            text: 'National'
        }
    },

    changeCollapsed: function() {
        this.setState({ collapsed: !this.state.collapsed, text: this.state.text });
    },

    setText: function(txt) {
        this.setState({ collapsed: true, text: txt });
    },

    render: function() {

        var toggleClass = this.state.collapsed ? 'toggle' : 'toggle--down';

        return  (
            <div className="wrapper">
                <div className="dropdown" onClick={ this.changeCollapsed }>
                    <div className={ toggleClass }></div>
                    <div className="text">{ this.state.text }</div>
                </div>
                <HierarchyList show={ !this.state.collapsed } hierarchy={ data.getItems() } initialNode={ this.state.text } levelHandler={ this.setText } />
            </div>
        );
    }
});

var HierarchyList = React.createClass({

    getInitialState: function() {
        return {
            filterType: 'filterByParent',
            selectedNode: this.props.initialNode,
            pendingNode: null,
            parentFilter: this.props.initialNode,
            inputFilter: ''
        }
    },

    componentWillReceiveProps(nextProps) {
        this.setState({ selectedNode: nextProps.initialNode, pendingNode: null, inputFilter: '', filterType: 'filterByParent' });
    },

    getItemCollection: function() {

        var self = this;

        return this.props.hierarchy.
            filter(function(item) {
                if (self.state.filterType == 'filterByParent') {
                    return item.parent === self.state.parentFilter;
                } else {
                    return item.title.toLowerCase().indexOf(self.state.inputFilter.toLowerCase()) !== -1;
                }
            });
    },

    setSelectedNode: function(node) {
        this.setState({ pendingNode: node });
    },

    setFilterByParent: function(newParent) {
        this.setState({ filterType: 'filterByParent',  parentFilter: newParent, inputFilter: '' });
    },

    setSearchValue: function(val) {
        this.setState({ filterType: 'filterByInput', inputFilter: val });
    },

    render: function() {

        var self = this;

        var style = {
            display: (this.props.show ? 'initial' : 'none')
        };

        return (
            <div className="body" style={ style }>
                <div className="header">
                    <SearchFiled value={ self.state.inputFilter } changeHandler={ self.setSearchValue } />
                    <BreadCrumb selected={ self.state.parentFilter } clickCrumb={ self.setFilterByParent } />
                </div>
                <ul className="list">
                    { this.getItemCollection().
                        map(function(item, id) {

                            item.isSelected = (item.title === self.state.pendingNode || (!self.state.pendingNode && item.title === self.state.selectedNode));

                            return(
                                <HierarchyNode key={id} selectNode={ self.setSelectedNode } drilldown={ self.setFilterByParent } node={ item } />
                            )
                        })
                    }
                </ul>
                <div className="footer">
                    <a className="cancel" onClick={ function(e) { e.preventDefault(); self.props.levelHandler(self.state.selectedNode) } }>Cancel</a>
                    <button className="select" onClick={ function(e) { e.preventDefault(); self.props.levelHandler((self.state.pendingNode ? self.state.pendingNode : self.state.selectedNode)) } }>Apply</button>
                </div>
            </div>
        );
    }
});

function SearchFiled(props) {

    function handleChange(e) {
        props.changeHandler(e.target.value);
    }

    return (
        <input
            className="search-input"
            placeholder="Search"
            type="text"
            value={props.value}
            onChange={handleChange}
        />
    );
}

function BreadCrumb(props) {

    function buildCrumbs() {

        return data.buildBreadcrumb(props.selected).
            map(function(item, idx) {

                var isCurrentLevel = props.selected === item;

                var className = (isCurrentLevel ? 'selected' : '');

                var clickHandler = ( isCurrentLevel ? null : function() { props.clickCrumb(item) } );

                return <span key={idx} className={ className } onClick={ clickHandler }>{ item }</span>;

            });
    }

    return (
        <div className="breadcrumb">
            { buildCrumbs() }
        </div>
    );

}

function HierarchyNode(props) {

    function onClick(e) {
        e.preventDefault();
        props.selectNode(props.node.title);
    }

    var style = {
        width: (props.node.hasChildren ? 90 : 100) + '%'
    };

    var className = "text" + (props.node.isSelected ? ' active' : '');

    var DrillDownButton = null;
    if (props.node.hasChildren) DrillDownButton = <NodeFilterButton clickHandler={ props.drilldown } newParent={ props.node.title } />;

    return (
        <li className="item">
            <div className={ className } style={ style } onClick={ onClick }>
                { props.node.title }
            </div>
            { DrillDownButton }
        </li>
    );
}

function NodeFilterButton(props) {

    function onClick(e) {
        e.preventDefault();
        props.clickHandler(props.newParent);
    }

    return (
        <div className="expand" onClick={ onClick }></div>
    );
}

ReactDOM.render(
    <HierarchyComponent />,
    document.getElementById('hierarchy')
);
