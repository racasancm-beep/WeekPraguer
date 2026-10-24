const fs = require('fs');
let c = fs.readFileSync('app/owner/dashboard/page.tsx', 'utf8');

const actionPanelCode = `
            {/* Pending Requests */}
            {pendingBookings.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Pending Requests (Action Required)</h2>
                    <div className="grid gap-4">
                        {pendingBookings.map((booking) => (
                            <Card key={booking.id} className="border-yellow-200 bg-yellow-50/30">
                                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <p className="font-semibold text-gray-900">{booking.space?.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Requested by: {booking.renter?.name || "Client"}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            onClick={async () => {
                                                const res = await fetch(\`/api/owner/bookings/\${booking.id}\`, {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ action: 'APPROVE' })
                                                });
                                                if (res.ok) {
                                                    toast.success('Booking approved!');
                                                    fetchData();
                                                }
                                            }}
                                            className="bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                                        >
                                            Approve
                                        </Button>
                                        
                                        <Button 
                                            variant="outline"
                                            onClick={async () => {
                                                const newStart = prompt('Enter new start time (YYYY-MM-DD HH:mm)');
                                                if (!newStart) return;
                                                const newEnd = prompt('Enter new end time (YYYY-MM-DD HH:mm)');
                                                if (!newEnd) return;
                                                
                                                const res = await fetch(\`/api/owner/bookings/\${booking.id}\`, {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ 
                                                        action: 'SUGGEST',
                                                        proposedStartTime: new Date(newStart),
                                                        proposedEndTime: new Date(newEnd)
                                                    })
                                                });
                                                if (res.ok) {
                                                    toast.success('Alternative suggested!');
                                                    fetchData();
                                                }
                                            }}
                                            className="text-xs h-8"
                                        >
                                            Suggest Alternative
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
`;

c = c.replace('<div className="grid gap-6 md:grid-cols-3">', actionPanelCode + '\n            <div className="grid gap-6 md:grid-cols-3">');

fs.writeFileSync('app/owner/dashboard/page.tsx', c);
