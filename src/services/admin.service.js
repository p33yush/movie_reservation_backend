const prisma=require('../config/database');

async function getDashboardStats(){
    const revenueAgg=await prisma.payment.aggregate({
        _sum:{
            amount:true
        },
        where:{
            status:'COMPLETED'
        }
    });

    const ticketsSold=await prisma.reservedSeat.count({
        where:{
            reservation:{
                status:'CONFIRMED'
            }
        }
    });

    const totalUsers=await prisma.user.count({
        where:{
            role:'USER'
        }
    });

    const movies=await prisma.movie.findMany({
        select:{
            title:true,
            showtimes:{
                select:{
                    reservations:{
                        where:{
                            status:'CONFIRMED'
                        },
                        select:{
                            totalAmount:true
                        }
                    }
                }
            }
        }
    });

    const revenueByMovie = movies.map(movie => {
        let movieRevenue = 0;

        movie.showtimes.forEach(showtime => {
            showtime.reservations.forEach(res => {
                movieRevenue+=parseFloat(res.totalAmount);
            });
        });
        return {
            title: movie.title,
            revenue: movieRevenue
        };
    }).filter(movie => movie.revenue >0).sort((a,b) => b.revenue-a.revenue);

    return {
        totalRevenue: revenueAgg._sum.amount ? parseFloat(revenueAgg._sum.amount): 0,
        ticketsSold,totalUsers,revenueByMovie
    };
}

module.exports = {getDashboardStats};