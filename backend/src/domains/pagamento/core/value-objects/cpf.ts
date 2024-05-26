export class CPF {
    private readonly value: string;

    constructor(value: string) {
        if (!this.isValid(value)) {
            throw new Error("Invalid CPF format");
        }
        this.value = value;
    }

    private isValid(cpf: string): boolean {
        cpf = cpf.toString().replace(/\D/g, '');  
        
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

        let sum = 0;
        let remainder;

        for (let i = 1; i <= 9; i++) {
            sum = sum + parseInt(cpf.substring(i-1, i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;
        
        sum = 0;

        for (let i = 1; i <= 10; i++) {
            sum = sum + parseInt(cpf.substring(i-1, i)) * (12 - i);
        }
        remainder = (sum * 10) % 11;
        
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    }

    public getValue(): string {
        return this.value;
    }

    public equals(comparable: CPF): boolean {
        return this.value === comparable.value;
    }
}
