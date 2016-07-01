var data = [
    {
        title: "National",
        parent: 'none',
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

var HierarchyComponent = React.createClass({

    getInitialState: function() {
        return {
            collapsed: true,
            currentLevel: 'National',
            currentNode: {
                title: "National",
                parent: 'none',
                hasChildren: true
            }
        }
    },

    dropdownHandle: function() {
        this.setState({ collapsed: !this.state.collapsed });
    },

    setCurrentNode: function(node) {
        console.log('Setting the current level to ', node);
        this.setState({ collapsed: true, currentNode: node })
    },

    render: function() {

        var toggleClass = this.state.collapsed ? 'toggle' : 'toggle--down';

        return  (
            <div className="wrapper">
                <div className="dropdown" onClick={ this.dropdownHandle }>
                    <div className={ toggleClass }></div>
                    <div className="text">{ this.state.currentNode.title }</div>
                </div>
                <HierarchyList show={ !this.state.collapsed } hierarchy={data} initialNode={ this.state.currentNode } levelHandler={this.setCurrentNode} />
            </div>
        );
    }
});

var HierarchyList = React.createClass({

    getInitialState: function() {
        return {
            searchFilter: '',
            parentFilter: this.props.initialNode.title,
            filterType: 'filterByParent',
            currentSelection: this.props.initialNode,
            pendingSelection: null
        }
    },

    componentWillUpdate: function(nextProps, nextState) {
        if (this.state.currentSelection !== this.props.initialNode && !nextState.pendingSelection) this.props.levelHandler(nextState.currentSelection);
    },

    setSelectedNode: function(node) {
        this.setState({ pendingSelection: node });
    },

    clearSelectedNode: function() {
        this.setState({ pendingSelection: null });
    },

    applySelectedNode: function() {
        this.setState({ currentSelection: this.state.pendingSelection, pendingSelection: null });
    },

    hasPendingSelection: function(title) {
        return (!!this.state.pendingSelection && this.state.pendingSelection.title == title);
    },

    hasCurrentSelection: function(title) {
        return ((!this.state.pendingSelection && !!this.state.currentSelection) && this.state.currentSelection.title == title);
    },

    setFilterByParent: function(newParent) {
        this.clearSearchValue();
        this.setState({ filterType: 'filterByParent',  parentFilter: newParent.title });
    },

    filterByParent: function(item) {
        return item.parent === this.state.parentFilter;
    },

    setSearchValue: function(val) {
        this.setState({ searchValue: val });
    },

    clearSearchValue: function() {
        this.setState({ searchValue: '' });
    },

    filterByTitle: function(item) {
        return  item.title.toLowerCase().indexOf(this.state.searchValue.toLowerCase()) !== -1;
    },

    getItemCollection: function() {

        return this.props.hierarchy.
        filter(this[this.state.filterType]);
    },

    cancelClickHandler: function(e) {
        e.preventDefault();

        console.log('canceling!');

        this.clearSelectedNode();
        this.clearSearchValue();
    },

    applyClickHandler: function(e) {
        e.preventDefault();

        this.applySelectedNode();
        this.clearSearchValue();
    },

    render: function() {

        var self = this;

        var style = {
            display: (this.props.show ? 'initial' : 'none')
        };

        var nodeList = this.getItemCollection().
        map(function(item, id) {
            var clickButton = null;

            if (item.hasChildren) clickButton = <NodeFilterButton clickHandler={ self.setFilterByParent.bind(self, item) } />;

            var isSelected = self.hasPendingSelection(item.title) || self.hasCurrentSelection(item.title);

            return(
                <HierarchyNode key={id}
                               isSelected={ isSelected }
                               clickHandler={ self.setSelectedNode.bind(self, item) }
                               node={item}>
                    { clickButton }
                </HierarchyNode>
            );
        });

        return (
            <div className="body" style={ style }>
                <div className="header">
                    <SearchFiled value={this.state.searchValue} changeHandler={this.setSearchValue}/>
                </div>
                <ul className="list">
                    { nodeList }
                </ul>
                <div className="footer">
                    <a className="cancel" onClick={this.cancelClickHandler} >Cancel</a>
                    <button className="select" onClick={this.applyClickHandler} >Apply</button>
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


function HierarchyNode(props) {

    var style = {
        width: (props.node.hasChildren ? 90 : 100) + '%'
    };

    var className = "text" + (props.isSelected ? ' active' : '');

    return (
        <li className="item">
            <div className={ className } style={ style } onClick={ props.clickHandler }>
                { props.node.title }
            </div>
            {props.children}
        </li>
    );
}

function NodeFilterButton(props) {

    return (
        <div className="expand" onClick={ props.clickHandler }></div>
    );
}

ReactDOM.render(
    <HierarchyComponent />,
    document.getElementById('hierarchy')
);