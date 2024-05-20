import { Router } from 'express'
import acessoRoute from '../domains/cliente/adapter/driver/rest/routes/cliente.route'
import pedidoRoute from '../domains/pedido/adapter/driver/rest/routes/pedido.route'
import produtoRoute from '../domains/pedido/adapter/driver/rest/routes/produto.route'
import pagamentoRoute from '../domains/pagamento/adapter/driver/rest/routes/pagamento.route'

const routes = Router()

routes.use('/api/pedidos', pedidoRoute)
routes.use('/api/clientes', acessoRoute)
routes.use('/api/pagamentos', pagamentoRoute)
routes.use('/api/produtos', produtoRoute)

export default routes;
