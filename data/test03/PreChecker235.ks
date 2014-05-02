public check(number) {
    if (number == 5)
        return true;
        
    return (number % 5 !== 0) && check23(number);    
}

fusion Checker235(@Checker23) {
    function verify(check23) {
        return check23(2) && check23(3);
    }

    test(verify(Checker23.check23)); 
}