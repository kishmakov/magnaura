public check23(number) {
    if (number == 3)
        return true;
        
    return (number % 3 != 0) && check2(number);    
}

fusion Checker23(@Checker2) {
    function verify(check2) {
        return check2(2);
    }

    test(verify(Checker2.check2)); 
}