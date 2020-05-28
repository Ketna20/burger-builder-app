import React from 'react';
import Aux from '../../hoc/Aux/Aux';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import axios from '../../axios-orders';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';

const INGREDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.4,
    meat: 1.3,
    bacon: 0.7
}

class BurgerBuilder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ingredients: null,
            totalPrice: 4,
            purchasable: false,
            purchasing: false,
            loading: false,
            error: false
        }
    }

    componentDidMount () {
       axios.get('https://burger-builder-app-33109.firebaseio.com/ingredients.json')
        .then(response=> {
            this.setState({ingredients: response.data});
        })
        .catch(error => {
            this.setState({ errr: true});
        });
   
    }
    
    updatePurchaseState (ingredients) {
        // const ingredients = {
        //     ...this.state.ingredients  //copies the existing ingredients 
        // };
        const sum = Object.keys(ingredients)
            .map(igKey => {        //igKey is salad, bacon, etc
                return ingredients[igKey]  
            })
            .reduce((sum, el) => {
                return sum + el;
            }, 0);  //this reduce to turn in single number(sum of all ingredients), not to flatten the array
            this.setState({purchasable: sum > 0});
    }

    addIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        const updatedCount = oldCount + 1;
        const updatedIngredients = {
            ...this.state.ingredients  // copies the all the other ingredients counts in the new array.
        }
        updatedIngredients[type] = updatedCount;
        const priceAddition = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice + priceAddition;
        this.setState({
            totalPrice: newPrice,
            ingredients: updatedIngredients
        });
        this.updatePurchaseState(updatedIngredients);
    }

    removeIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        if(oldCount <= 0){
            return;
        }
        const updatedCount = oldCount - 1;
        const updatedIngredients = {
            ...this.state.ingredients  // copies the all the other ingredients counts in the new array.
        }
        updatedIngredients[type] = updatedCount;
        const priceDeduction = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice - priceDeduction;
        this.setState({
            totalPrice: newPrice,
            ingredients: updatedIngredients
        });
        this.updatePurchaseState(updatedIngredients);
    }

    purchaseHandler = () => {
        this.setState({purchasing: true});
    }

    purchaseCancelledHandler = () => {
        this.setState({purchasing: false});
    }

    purchaseContinueHandler = () => {
        //alert('You Continue!');
        this.setState( { loading: true } );
        //in firebase, (MongoDB) it will add orders node (no need of tables)
        // it adds all the data in json format.
        const order = {
            ingredients: this.state.ingredients,
            price: this.state.totalPrice,  //in real app, recalculate the price here
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
                this.setState( { loading: false, purchasing: false } );
            })
            .catch(error => {
                this.setState( { loading: false, purchasing: false } );
            }); 
    }

    render () {
        const disabledInfo = {
            ...this.state.ingredients
        };
        for(let key in disabledInfo) {
            // {salad: true, meat: false, ...}
            disabledInfo[key] = disabledInfo[key] <= 0
        }
        let orderSummary= null;
        
        if(this.state.loading){
            orderSummary = <Spinner />;   
        }
        let burger = this.state.error ? <p>Ingredients can't be loaded.</p> : <Spinner />;

        if(this.state.ingredients) {
            burger = (
                <Aux>
                    <Burger ingredients={this.state.ingredients} />
                    <BuildControls 
                         ingredientsAdded={this.addIngredientHandler} 
                         ingredientRemoved={this.removeIngredientHandler}
                         disabled={disabledInfo}
                         purchasable={this.state.purchasable}
                         ordered={this.purchaseHandler}
                         price={this.state.totalPrice}
                    />
                </Aux>
            );
            orderSummary = <OrderSummary 
                    ingredients={this.state.ingredients} 
                    price={this.state.totalPrice}
                    purchaseCancelled={this.purchaseCancelledHandler}
                    purchaseContinued={this.purchaseContinueHandler}
                    />
        }
        
        if(this.state.loading){
            orderSummary = <Spinner />;   
        }
        
        return (
            <Aux>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelledHandler}>
                    {orderSummary}
                </Modal>
                {burger}
            </Aux>
        );
    }
}

export default withErrorHandler(BurgerBuilder, axios);