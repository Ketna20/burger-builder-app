import React from 'react';
import { connect } from 'react-redux';
import Aux from '../../hoc/Aux/Aux';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import axios from '../../axios-orders';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import * as burgerBuilderActions from '../../store/actions/index';


class BurgerBuilder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            purchasing: false
            // loading: false,
            // error: false
        }
    }

    componentDidMount () {
        console.log(this.props);
        this.props.onInitIngredients();
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
            return sum > 0;
    }

    
    
    purchaseHandler = () => {
        this.setState({purchasing: true});
    }

    purchaseCancelledHandler = () => {
        this.setState({purchasing: false});
    }

     purchaseContinueHandler = () => {
        this.props.history.push('/checkout');
    //     const queryParams = [];
    //     for (let i in this.state.ingredients) {
    //         queryParams.push(encodeURIComponent(i) + "=" + encodeURIComponent(this.state.ingredients[i]));
    //     }
    //     queryParams.push('price=' + this.state.totalPrice);
    //     const queryString = queryParams.join('&');
    //     this.props.history.push({
    //             pathname: '/checkout',
    //             search: '?' + queryString
    //     });
    }

    render () {
        const disabledInfo = {
            ...this.props.ings
        };
        for(let key in disabledInfo) {
            // {salad: true, meat: false, ...}
            disabledInfo[key] = disabledInfo[key] <= 0
        }
        let orderSummary= null;
        
        // if(this.state.loading){
        //     orderSummary = <Spinner />;   
        // }
        let burger = this.props.error ? <p>Ingredients can't be loaded.</p> : <Spinner />;

        if(this.props.ings) {
            burger = (
                <Aux>
                    <Burger ingredients={this.props.ings} />
                    <BuildControls 
                         ingredientsAdded={this.props.onIngredientAdded} 
                         ingredientRemoved={this.props.onIngredientRemoved}
                         disabled={disabledInfo}
                         purchasable={this.updatePurchaseState(this.props.ings)}
                         ordered={this.purchaseHandler}
                         price={this.props.price}
                    />
                </Aux>
            );
            orderSummary = <OrderSummary 
                    ingredients={this.props.ings} 
                    price={this.props.price}
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

const mapStateToProps = state => {
    return {
        ings: state.ingredients,
        price: state.totalPrice,
        error: state.error
    };
}

const mapDispatchToProps = dispatch => {
    return {
        onIngredientAdded: (ingName) => dispatch(burgerBuilderActions.addIngredient(ingName)),
        onIngredientRemoved: (ingName) => dispatch(burgerBuilderActions.removeIngredient(ingName)),
        onInitIngredients: () => dispatch(burgerBuilderActions.initIngredients())
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(BurgerBuilder, axios));