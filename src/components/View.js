import React, {PropTypes, Component} from 'react';
import {Segment, Grid, Form, Button} from 'semantic-ui-react';

export default class View extends Component {
    constructor(props) {
        super(props);
        this.generateInputs = ::this.generateInputs;
    }

    static propTypes = {
        schema: PropTypes.object,
        query: PropTypes.func,
        data: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.boolean
        ]),
        fields: PropTypes.array,
        update: PropTypes.func,
        remove: PropTypes.func,
        currentItemId: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.boolean
        ]),
        _addNewItem: PropTypes.func
    }

    state = {
        schema: this.props.schema,
        fields: this.props.fields,
        data: this.props.data,
        currentItemId: this.props.currentItemId
    }

    componentWillReceiveProps() {
        this.setState({
            schema: this.props.schema,
            fields: this.props.schema.fields,
            data: this.props.data,
            currentItemId: this.props.currentItemId
        });
    }

    getDateValue(arg) {
        let date = new Date(arg),
            y = date.getFullYear(),
            m = (date.getMonth() + 1).toString().length === 2 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`,
            d = date.getDate().toString().length === 2 ? date.getDate() : `0${date.getDate()}`;
        return `${y}-${m}-${d}`;
    }

    checkOnEnterIfTextarea(e) {
        if (e.target.nodeName === 'INPUT' && e.target.value.length > 100) {
            let textarea = document.createElement('textarea');
            textarea.id = e.target.id;
            textarea.placeholder = e.target.placeholder;
            textarea.innerText = e.target.value;

            e.target.parentNode.insertBefore(textarea, e.target);
            e.target.parentNode.removeChild(e.target);
            document.getElementById(textarea.id).focus();
        }
    }

    generateInputs(field, idx) {
        let propName = Object.keys(field)[0],
            value = '',
            checked = '',
            dateInput = false,
            data = this.state.data,
            control = field[propName].inputControl;

        function isDate(val) {
            var d = new Date(val);
            return !isNaN(d.valueOf()) &&
                typeof (val) !== 'boolean' &&
                typeof (val) !== 'number' &&
                typeof (+val) !== 'number';
        }

        if (data && (data[propName] ||
            typeof (data[propName]) === 'boolean') &&
            field[propName].inputType !== 'file') {
            value = data[propName];
            if (value.length > 100) {
                control = 'textarea';
            }
        } else {
            value = '';
        }
        if (data && field[propName].inputType === 'checkbox') {
            checked = !data ? false : data[propName];
        } else {
            checked = false;
        }

        if (isDate(value) ||
            propName === 'createdAt' ||
            propName === 'updatedAt' ||
            propName === 'deletedAt' ||
            field[propName].inputType === 'date') {
            dateInput = 'date';
            value = !data ? '' : this.getDateValue(value);
        }

        let type = dateInput || field[propName].inputType;

        if (data || (propName !== 'id' && propName !== '_id' && propName !== 'offset' && propName !== 'limit')) {
            return (
                <Form.Field
                    key={idx}
                    label={field[propName].label}
                    control={control}
                    type={type}
                    id={propName}
                    defaultValue={value}
                    defaultChecked={checked}
                    onInput={this.checkOnEnterIfTextarea}
                    disabled={!data ? false : propName === '_id' || propName === 'id' ? true : field[propName].disabled}
                    placeholder={propName}/>
            );
        }
    }

    render() {
        const {Column} = Grid;
        const {fields, schema, currentItemId} = this.state;
        let {update, remove, _addNewItem} = this.props,
            {generateInputs} = this,
            to = (fields.length / 2).toFixed(0),
            from = fields.length - to;

        return (
            <Segment color='black' className='View'>
                <div className='btn-row'>
                    {currentItemId ?
                        <Button type='submit' color='black'
                                onClick={_addNewItem}
                                disabled={!schema.resolvers.create}>
                            add new
                        </Button> : null}
                    <Button type='submit' color='black'
                            onClick={!schema.resolvers.update ? null : update}
                            disabled={!schema.resolvers.update}>
                        save
                    </Button>
                    <Button type='submit' color='black'
                            id={currentItemId}
                            onClick={!schema.resolvers.remove ? null : remove}
                            disabled={!schema.resolvers.remove}>
                        remove
                    </Button>
                </div>
                <Grid as={Form}>
                    <Column computer={8} mobile={16}>
                        {fields.slice(0, to).map((field, idx) =>
                            generateInputs(field, idx)
                        )}
                    </Column>
                    <Column computer={8} mobile={16}>
                        {fields.slice(-from).map((field, idx) =>
                            generateInputs(field, idx)
                        )}
                    </Column>
                </Grid>
            </Segment>
        );
    }
}