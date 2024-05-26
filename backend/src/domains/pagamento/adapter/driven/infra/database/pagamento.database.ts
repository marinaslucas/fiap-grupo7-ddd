import { IPagamento } from "../../../../../../domains/pagamento/core/applications/ports/pagamento.port";
import {
  Pagamento,
  PagamentoDados,
} from "domains/pagamento/core/entities/pagamento";
import { PagamentoVersao } from "domains/pagamento/core/entities/pagamento.versao";
import { Email } from "domains/pagamento/core/value-objects/email";
import { CPF } from "domains/pagamento/core/value-objects/cpf";
import { Repository } from "domains/suporte/infra/database/repository";

export class PagamentoDatabase extends Repository implements IPagamento {
  private COLLECTION_PAGAMENTO = "pagamentos";
  private COLLECTION_LANCHONETE = "lanchonete";

  constructor() {
    super(process.env.DATABASE_URL!);
  }

  async getPagamentoRef() {
    const pagamentoRef = await this.getCollection(
      this.COLLECTION_LANCHONETE,
      this.COLLECTION_PAGAMENTO
    );
    return pagamentoRef;
  }

  async criar(pagamento: Pagamento): Promise<PagamentoVersao | null> {
    try {
      const pagamentoRef = await this.getPagamentoRef();

      const result = await pagamentoRef.insertOne({
        nome: pagamento.getNome(),
        cpf: pagamento.getCpf(),
        email: pagamento.getEmail(),
        valor: pagamento.getValor(),
        parcelamento: pagamento.getParcelamento(),
        meio: pagamento.getTipo(),
        identificadorExterno: pagamento.getIdentificadorExterno(),
        data: pagamento.getData(),
        parceiroNegocio: pagamento.getParceiroNegocio(),
        metadata: pagamento.getMetadata(),
        status: pagamento.getStatus(),
      });

      return new PagamentoVersao(
        result.insertedId.toString(),
        result.insertedId.getTimestamp()
      );
    } catch (error) {
      console.error("Erro ao criar pagamento:", error);
      return null;
    }
  }

  async buscaUltimaVersao(
    identificadorExterno: string
  ): Promise<Pagamento | null> {
    try {
      const pagamentoRef = await this.getPagamentoRef();
      const cursor = pagamentoRef
        .find(
          { identificadorExterno, versionado: { $exists: false } },
          { sort: { _id: -1 } }
        )
        .limit(1);
      const data = await cursor.next();

      if (!data) return null;
      const { cpf, nome, email, valor, parcelamento, tipo } = data;
      const pagamentoData: PagamentoDados = {
        nome: nome,
        cpf: new CPF(cpf),
        email: new Email(email),
        valor: valor,
        parcelamento: parcelamento,
        tipo: tipo,
        identificadorExterno,
      };

      const pagamento = new Pagamento(pagamentoData);

      return pagamento;
    } catch (error) {
      console.error("Erro ao buscar última versão do pagamento:", error);
      return null;
    }
  }

  async versiona(pagamento: Pagamento): Promise<boolean> {
    try {
      const pagamentoRef = await this.getPagamentoRef();
      const id = this.toObjectId(pagamento.getVersao()?.versao!);
      const response = await pagamentoRef.updateOne(
        { _id: id},
        { $set: { versionado: true } },
        { upsert: true }
      );

      return response.modifiedCount === 1;
    } catch (error) {
      console.error("Erro ao versionar pagamento:", error);
      return false;
    }
  }
}
