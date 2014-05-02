public check(number) {
    if (number == 7)
        return true;
        
    return (number % 7 !== 0) && check23(number);    
}

fusion Checker237(@Checker23) {
    function verify(check23) {
        return check23(2) && check23(3);
    }

    test(verify(Checker23.check23)); 
}