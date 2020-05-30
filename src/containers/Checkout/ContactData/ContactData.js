import React from 'react';
import Button from '../../../components/UI/Button/Button';
import classes from './ContactData.module.css';
import axios from '../../../axios-orders';
import Spinner from '../../../components/UI/Spinner/Spinner';

class ContactData extends React.Component {
    state = {
        name: '',
        email: '',
        addres: {
            street: '',
            zipCode: ''
        },
        loading: false
    }

    orderHandler = (event) => {
        event.preventDefault();
        this.setState( { loading: true } );
        //in firebase, (MongoDB) it will add orders node (no need of tables)
        // it adds all the data in json format.
        const order = {
            ingredients: this.props.ingredients,
            price: this.props.price,  //in real app, recalculate the price here
            customer: {
                name: 'kk',
                address: {
                    street: 'Abc St',
                    zipCode: '00000',
                    country: 'USA'
                },
                email: 'kk@test.com'
            },
            deliveryMethod: 'fastest'
        }
        axios.post('/orders.json', order)
            .then(response => {
                this.setState( { loading: false } );
                this.props.history.push('/');
            })
            .catch(error => {
                this.setState( { loading: false } );
            });
    }

    render () {
        let form = (
            <form>
                <input className={classes.Input} type="text" name="name" placeholder="Your name" />
                <input className={classes.Input} type="email" name="email" placeholder="Your email" />
                <input className={classes.Input} type="text" name="street" placeholder="street" />
                <input className={classes.Input} type="text" name="zipCode" placeholder="Zipcode" />
                <Button btnType="Success" clicked={this.orderHandler}>ORDER</Button>
            </form>
        );
        if (this.state.loading) {
            form = <Spinner />;
        }
        return (
            <div className={classes.ContactData}>
                <h4>Enter Your Contact Data</h4>
                {form}
            </div>
        );

    }
}

export default ContactData;